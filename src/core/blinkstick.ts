import { determineReportId } from '../utils/hid/determine-report-id';
import { decimalToHex } from '../utils/decimal-to-hex';
import { getInfoBlockRaw } from '../utils/hid/get-info-block';
import { setInfoBlock } from '../utils/hid/set-info-block';
import type { ColorOptions, NormalizedColorOptions } from '../types/color-options';
import { clampRgb } from '../utils/clamp';
import { setTimeout } from 'timers/promises';
import { blinkstickFinalizationRegistry } from './blinkstick-finalization-registry';
import { MorphOptions } from '../color-change-options/morph-options';
import { SetColorOptions } from '../color-change-options/set-color-options';
import { retryNTimes } from '../utils/retry-n-times';
import { Channel } from '../types/enums/channel';
import {
  interpretParameters,
  interpretParametersInversed,
} from '../utils/colors/interpret-parameters';
import type { BlinkStickProMode } from '../types/enums/mode';
import { attemptToGetDeviceDescription } from '../consts/device-descriptions';
import { isDefined } from '../utils/is-defined';
import { AnimationRunner } from '../animations/animation-runner';
import { LedGroup } from '../led/led-group';
import { asBuffer } from '../utils/as-buffer';
import { Led } from '../led/led';
import type { RgbTuple } from '../types/rgb-tuple';
import { assert, typeGuard } from 'tsafe';
import { createWriteStream, WriteStream } from 'node:fs';
import { promisify } from 'node:util';
import * as os from 'node:os';
import { scheduler } from 'node:timers/promises';
import { FeatureReportId } from '../types';
import { MinimalDeviceInfo, UsbTransport } from '../transport';
import { Buffer } from 'node:buffer';
import { getRandomColor } from '../utils';

function wrapWithDebug<T extends UsbTransport>(
  device: T,
  cb: (type: string, ...args: unknown[]) => void,
): T {
  let i = 0;
  const originalMethods = {
    sendFeatureReport: device.sendFeatureReport.bind(device),
    getFeatureReport: device.getFeatureReport.bind(device),
    getDeviceInfo: device.getDeviceInfo.bind(device),
  };

  return new Proxy(device, {
    get(target, prop) {
      if (typeGuard<keyof typeof originalMethods>(prop, prop in originalMethods)) {
        const originalMethod = originalMethods[prop];
        return (...args: Parameters<typeof originalMethod>[]) => {
          const callId = i++;
          cb(`call-${String(prop)}`, { callId }, ...args);
          // @ts-expect-error Bad type inference, but we know the types are correct
          const result = originalMethod(...args);
          if (result instanceof Promise) {
            return result
              .then((res: unknown) => {
                cb(`result-${String(prop)}`, { callId }, res);
                return res;
              })
              .catch((err: unknown) => {
                cb(`error-${String(prop)}`, { callId }, err);
                throw err;
              });
          }
          return result;
        };
      }
      return Reflect.get(target, prop, target);
    },
  });
}

/**
 * Main class responsible for controlling BlinkStick devices.
 * @category Core
 */
export abstract class BlinkStick<Transport extends UsbTransport = UsbTransport> {
  public abstract readonly isSync: boolean;
  protected abortController: AbortController = new AbortController();
  /**
   * Changes the default retry count for sending feature reports.
   */
  public defaultRetryCount = 5;
  public ledCount: number;
  readonly requiresSoftwareColorPatch: boolean;
  readonly device: Transport;
  readonly serial: string;
  readonly manufacturer: string;
  readonly product: string;
  readonly versionMajor: number;
  readonly versionMinor: number;
  protected _animation?: AnimationRunner;
  protected _inverse = false;
  public readonly deviceDescription;
  protected commandDebug: string | null;
  protected debugWriteStream: WriteStream | null = null;
  protected deviceInfo: MinimalDeviceInfo;
  protected isLinux: boolean = process.platform === 'linux';

  public interpretParameters: typeof interpretParameters = interpretParameters;

  /**
   *
   * @internal This is not intended to be used outside of the library. End-users should use `find*` functions
   */
  protected constructor(device: Transport) {
    this.commandDebug = process.env.BLINKSTICK_DEBUG ?? null;
    if (this.commandDebug) {
      this.device = wrapWithDebug(device, (type: string, ...args: unknown[]) =>
        this.writeDebugCommand(type, ...args),
      );
    } else {
      this.device = device;
    }
    this.deviceInfo = device.getDeviceInfo();
    this.serial = this.deviceInfo.serialNumber ?? '';
    this.manufacturer = this.deviceInfo.manufacturer ?? '';
    this.product = this.deviceInfo.product ?? '';
    const [versionMajor, versionMinor] = this.serial.split('-').pop()!.split('.').map(Number);
    this.versionMajor = versionMajor;
    this.versionMinor = versionMinor;

    this.deviceDescription = attemptToGetDeviceDescription(this.deviceInfo);
    this.ledCount = this.deviceDescription?.ledCount ?? 0;
    if (this.ledCount === 0) {
      process.emitWarning(`Device ${this.product} does not have a known LED count.`, {
        code: `BlinkStickUnknownLedCount-${this.serial}`,
        ...this.deviceInfo,
      });
    }

    // This seems relevant only for a base device?
    this.requiresSoftwareColorPatch =
      this.versionMajor == 1 && this.versionMinor >= 1 && this.versionMinor <= 3;
  }

  public get inverse() {
    return this._inverse;
  }

  public set inverse(value: boolean) {
    this._inverse = value;
    if (this._inverse) {
      this.interpretParameters = interpretParametersInversed;
    }
  }

  /**
   * This allows BlinkStick instances to be used with explicit resource management
   */
  async [Symbol.asyncDispose]() {
    await this.close();
  }

  /**
   * Gets animation runner for the device.
   * If device has unknown number of LEDs, getter will return null.
   * If device is in inverse mode, getter will return null.
   */
  get animation(): AnimationRunner | null {
    if (this.inverse) {
      return null;
    }
    if (this._animation) {
      return this._animation;
    }
    if (this.ledCount) {
      this._animation = new AnimationRunner(this);
      return this._animation;
    } else {
      return null;
    }
  }

  /**
   * Low-level method that directly sends a feature report to the device.
   * @param data
   */
  async sendFeatureReport(data: number[] | Buffer) {
    return await this.device.sendFeatureReport(asBuffer(data));
  }

  /**
   * Returns the serial number of device.
   *
   * <pre>
   * BSnnnnnn-1.0
   * ||  |    | |- Software minor version
   * ||  |    |--- Software major version
   * ||  |-------- Denotes sequential number
   * ||----------- Denotes BlinkStick device
   * </pre>
   *
   * Software version defines the capabilities of the device
   * @deprecated Use `.serial` directly
   */
  getSerial() {
    return this.serial;
  }

  /**
   * Close BlinkStick device and stop all animations
   */
  async close() {
    blinkstickFinalizationRegistry.unregister(this);
    await this.stop();
    await this.device.close();
    if (this.debugWriteStream) {
      await promisify((cb) => this.debugWriteStream!.end(cb))();
      this.debugWriteStream = null;
    }
  }

  /**
   * Stop all animations
   */
  async stop() {
    await this.animation?.stop();
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  /**
   * Set the color of LEDs
   *
   * @example
   *     //Available overloads
   *     setColor(red, green, blue, [options]); // use [0..255] ranges for intensity
   *
   *     setColor(color, [options]); // use '#rrggbb' format
   *
   *     setColor(color_name, [options]); // use 'random', 'red', 'green', 'yellow' and other CSS supported names
   *
   */
  async setColor(...options: ColorOptions<SetColorOptions>): Promise<void> {
    const { interpretParameters } = this;
    const params = interpretParameters(...options);
    if (this.requiresSoftwareColorPatch) {
      // eslint-disable-next-line prefer-const
      let [cr, cg, cb] = await this.getColor();

      if (params.r == cg && params.g == cr && params.b == cb) {
        // TODO: figure out why original code never changed cb here.
        if (cr > 0) {
          cr = cr - 1;
        } else if (cg > 0) {
          cg = cg - 1;
        }
        await this.sendColor(interpretParameters(cr, cg, cb));
        await this.sendColor(interpretParameters(params.r, params.g, params.b));
      } else {
        await this.sendColor(interpretParameters(params.r, params.g, params.b));
      }
      return;
    } else {
      await this.sendColor(params);
    }
  }

  protected async sendColor(params: NormalizedColorOptions): Promise<void> {
    const {
      r,
      g,
      b,
      options: { channel = 0, index = 0 },
    } = params;
    if (params.options.channel === 0 && params.options.index === 0) {
      return await this.setFeatureReport(Buffer.from([FeatureReportId.SetFirst, r, g, b]));
    } else {
      return await this.setFeatureReport(
        Buffer.from([FeatureReportId.SetArbitraryPixel, channel, index, r, g, b]),
      );
    }
  }

  /**
   * Set inverse mode for IKEA DIODER in conjunction with BlinkStick Pro
   * Seemingly, this is effectively deprecated in favor of setting mode on BlinkStick Pro directly.
   *
   * @param {Boolean} inverse Set true for inverse mode and false otherwise
   * @deprecated Use `.inverse` directly
   */
  setInverse(inverse: boolean) {
    this.inverse = inverse;
  }

  /**
   * @deprecated Use `.inverse` directly
   */
  getInverse() {
    return this.inverse;
  }

  /**
   * Set mode for BlinkStick Pro. This will persist across reboots.
   *
   * - 0 = Normal
   * - 1 = Inverse
   * - 2 = WS2812
   *
   * You can read more about BlinkStick modes by following this link:
   *
   * http://www.blinkstick.com/help/tutorials/blinkstick-pro-modes
   */
  async setMode(mode: BlinkStickProMode): Promise<void> {
    await this.setFeatureReport(asBuffer([FeatureReportId.SetMode, mode]));
  }

  /**
   * Gets the current mode.
   */
  async getMode(): Promise<BlinkStickProMode> {
    return asBuffer(
      await this.getFeatureReport(FeatureReportId.SetMode, 33),
    )[1] as BlinkStickProMode;
  }

  /**
   * Sets the number of LEDs on "supported" devices.
   * Note that unplugging and plugging the device may be necessary for the change to take effect.
   * @param count
   * @experimental
   */
  async setLedCountAtDevice(count: number): Promise<void> {
    assert(count > 0, 'LED count must be greater than 0');
    assert(count <= 255, 'LED count must be less than or equal to 255');
    // self._usb_ctrl_transfer(0x20, 0x9, 0x81, 0, control_string)
    const report = Buffer.from(new Uint8Array([0x81, count]));
    await this.sendFeatureReport(report);
    this.ledCount = count;
    this._animation?.stop();
    this._animation = undefined;
  }

  /**
   * Gets the number of LEDs from the device.
   * @experimental
   */
  async getLedCountFromDevice(): Promise<number> {
    const ret = await this.getFeatureReport(0x81, 2);
    assert(ret.length === 2, `Expected report length to be 2, got ${ret.length}`);
    assert(ret[1] > 0, `LED count must be greater than 0 (found: ${ret[1]})`);
    return ret[1];
  }

  /**
   * Loads the LED count from the device on "supported" devices.
   * @experimental
   */
  async loadLedCountFromDevice(): Promise<this> {
    this.ledCount = await this.getLedCountFromDevice();
    this._animation?.stop();
    this._animation = undefined;

    return this;
  }

  /**
   * Set a random color on BlinkStick.
   * @param index The index of the LED, 0 is default
   */
  async setRandomColor(index = 0) {
    return await this.setColor(getRandomColor(), { index });
  }

  /**
   * Get the current color visible on BlinkStick
   * @param index The index of the LED, 0 is default
   */
  async getColor(index = 0): Promise<RgbTuple> {
    if (index === 0) {
      const buffer = await this.getFeatureReport(0x0001, 33);
      if (buffer) {
        return [buffer[1], buffer[2], buffer[3]];
      } else {
        return [0, 0, 0];
      }
    } else {
      const colors = await this.getColors(index);
      return [colors[index * 3 + 1], colors[index * 3], colors[index * 3 + 2]];
    }
  }

  /**
   * Get the current color frame on BlinkStick Pro
   * @example
   *  .getColors(8);
   * @return {Array} Callback returns an array of LED data in the following format: [g0, r0, b0, g1, r1, b1...]
   * * */
  async getColors(count: number): Promise<Buffer> {
    const { reportId, maxLeds } = determineReportId(count * 3);
    const report = await this.getFeatureReport(reportId, maxLeds * 3 + 2);
    return report.subarray(2, report.length - 1);
  }

  /**
   * Set the color frame on BlinkStick Pro
   * Missing colors are filled with zeros.
   * Note - this method seemingly has DIFFERENT behavior on different devices.
   * @param channel Channel is represented as 0=R, 1=G, 2=B
   * @param data LED data in the following format: [g0, r0, b0, g1, r1, b1...]
   */
  async setColors(channel: Channel, data: number[] | Uint8Array | Buffer) {
    const { reportId, maxLeds } = determineReportId(data.length);
    if (this.isLinux && data.length > 63) {
      // Linux has a limit of 65 bytes for feature reports, so we need to split the data into multiple reports
      return await this.setBigColorsOnLinux(channel, asBuffer(data));
    }
    const maxDataBytes = maxLeds * 3;
    const offset = 2;
    const reportLength = offset + maxDataBytes;
    const report = Buffer.alloc(reportLength);
    report[0] = reportId;
    report[1] = channel;

    const copyLength = Math.min(data.length, maxDataBytes);
    const source = asBuffer(data);
    source.copy(report, offset, 0, copyLength);

    await this.setFeatureReport(asBuffer(report));
  }

  /**
   * A workaround for setting colors on Flex on Linux.
   * @param channel
   * @param data
   */
  protected async setBigColorsOnLinux(channel: Channel, data: Buffer) {
    assert(data.length % 3 === 0, 'Data length must be a multiple of 3');
    const ledOffset = 16; // First 16 LEDs are set with a single feature report
    const first16LedsData = data.subarray(0, ledOffset * 3);
    await this.sendFeatureReport(
      Buffer.from([FeatureReportId.Set16Pixels, channel, ...first16LedsData]),
    );
    const buff = asBuffer(data).subarray(ledOffset * 3); // Skip first 16 LEDs, as we use bulk transfer for those
    // const buff = asBuffer(data);
    const rgbTuples: { rgb: RgbTuple; ledIndex: number }[] = [];
    for (let i = 0; i < buff.length; i += 3) {
      const ledIndex = i + ledOffset; // Start from 16, as we already set first 16 LEDs
      // Here data is in GRB format, so we need to convert it to RGB
      const r = buff[i + 1] | 0;
      const g = buff[i] | 0;
      const b = buff[i + 2] | 0;
      rgbTuples.push({ rgb: [r, g, b], ledIndex });
    }

    const shuffled = rgbTuples.sort(() => Math.random() - 0.5);

    for (const {
      rgb: [r, g, b],
      ledIndex,
    } of shuffled) {
      try {
        await retryNTimes(
          3,
          () =>
            this.sendFeatureReport(
              Buffer.from([FeatureReportId.SetArbitraryPixel, channel, ledIndex, r, g, b]),
            ),
          { ledIndex },
          (n) => scheduler.wait((n + 1) ** 2 * 10),
        );
      } catch (err) {
        if (ledIndex > 22) {
          // Did you know? BlinkStick Flex firmware is buggy and LEDs 23+ are not supported?
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Get the current color as hex string.
   * @param index The index of the LED, 0 is default
   * @deprecated Use utils functions instead
   */
  async getColorString(index: number = 0): Promise<`#${string}`> {
    const [r, g, b] = await this.getColor(index);
    return `#${decimalToHex(r, 2)}${decimalToHex(g, 2)}${decimalToHex(b, 2)}`;
  }

  /**
   * Get the infoblock1 of the device.
   * This is a 32 byte array that can contain any data. It's supposed to
   * hold the "Name" of the device making it easier to identify rather than
   * a serial number.
   */
  async getInfoBlock1(): Promise<Buffer> {
    return await getInfoBlockRaw(this, 0x0002);
  }

  /**
   * Sets the infoblock1 with specified string.
   * It fills the rest of bytes with zeros.
   *
   * Usage:
   *
   * @example
   * ```
   *     setInfoBlock1(Buffer.from("abcdefg", 'hex'));
   * ```
   * @param data
   */
  async setInfoBlock1(data: Buffer) {
    return await setInfoBlock(this, FeatureReportId.InfoBlock1, data);
  }

  /**
   * Get the infoblock2 of the device.
   * This is a 32 byte array that can contain any data.
   */
  async getInfoBlock2() {
    return await getInfoBlockRaw(this, FeatureReportId.InfoBlock2);
  }

  async setInfoBlock2(data: Buffer) {
    return await setInfoBlock(this, FeatureReportId.InfoBlock2, data);
  }

  turnOff(index: number = 0) {
    return this.setColor(0, 0, 0, { index });
  }

  async turnOffAll() {
    await this.leds().setColor([0, 0, 0]);
  }

  /**
   * @deprecated Use Animation API instead
   */
  async blink(...options: ColorOptions) {
    const { interpretParameters } = this;
    const params = interpretParameters(...options);
    const abortSignal = AbortSignal.any(
      [this.abortController.signal, params.options.signal].filter(isDefined),
    );

    const repeats = params.options.repeats ?? 1;
    const delay = params.options.delay ?? 500;

    for (let i = 0; i < repeats; i++) {
      await this.setColor(params.r, params.g, params.b, params.options);
      await setTimeout(delay, null, { signal: abortSignal });
      await this.setColor(0, 0, 0, params.options);
    }
  }

  /**
   * Set a feature report to the device, and returns read data from the device.
   *
   * @param reportId Report ID to receive
   * @param data Data to send to the device
   * @param maxRetries Maximum number of retries
   */
  async setFeatureReportAndRead(
    reportId: number,
    data: Buffer,
    maxRetries: number = this.defaultRetryCount,
  ): Promise<Buffer> {
    assert(data[0] === reportId, 'First byte of data must be the report ID');
    return await retryNTimes(maxRetries, async () => {
      await this.sendFeatureReport(data);
      return asBuffer(await this.device.getFeatureReport(reportId, data.length));
    });
  }

  /**
   * Set a feature report to the device.
   * @param data - First byte is report ID, the rest is data
   * @param maxRetries
   */
  async setFeatureReport(data: Buffer, maxRetries: number = 5) {
    await retryNTimes(maxRetries, () => this.sendFeatureReport(data), {
      reportId: data[0],
      dataLength: data.length,
    });
  }

  protected getDebugWriteStream(): WriteStream {
    if (this.debugWriteStream) {
      return this.debugWriteStream;
    }
    if (!this.commandDebug) {
      throw new Error('Command debug is not enabled');
    }
    const filePath = this.commandDebug
      .replace('%SERIAL', this.serial)
      .replace('%RELEASE', String(this.deviceInfo.release))
      .replace('%PID', String(process.pid))
      .replace('%NAME', this.product);

    process.emitWarning(`Debugging commands will be written to ${filePath}`);

    this.debugWriteStream = createWriteStream(filePath, { flags: 'a' });

    return this.debugWriteStream;
  }

  /**
   * This method is used to write debug commands to the debug stream.
   * It should never be called if `commandDebug` is not set.
   */
  protected writeDebugCommand(type: string, ...args: unknown[]) {
    const debugInfo = {
      serial: this.serial,
      product: this.product,
      release: this.deviceInfo.release,
      pid: process.pid,
      stack: new Error().stack
        ?.split(os.EOL)
        .slice(2)
        .map((v) => v.trim().replace(/at (async )?/, ''))
        .join(os.EOL)
        .replaceAll(process.cwd(), '.'),
    };
    this.getDebugWriteStream().write(
      JSON.stringify(
        [debugInfo, type, ...args],
        (_k, v) => {
          if (typeof v === 'bigint') {
            return v.toString();
          }
          if (v instanceof Buffer) {
            return {
              type: 'Buffer',
              data: asBuffer(v).toString('hex'),
              length: v.length,
            };
          }
          if (Array.isArray(v) && v.every((item) => typeof item === 'number')) {
            return {
              type: 'Buffer',
              data: asBuffer(v).toString('hex'),
              length: v.length,
            };
          }
          if (v instanceof Error) {
            return {
              ...v,
              name: v.name,
              constructorName: v.constructor.name,
              message: v.message,
              stack: v.stack,
            };
          }
          return v;
        },
        0,
      ) + os.EOL,
    );
  }

  /**
   * Morphs to specified RGB color from current color.
   *
   * Function supports the following overloads:
   *
   * @example
   *     //Available overloads
   *     morph(red, green, blue, [options], [callback]); // use [0..255] ranges for intensity
   *
   *     morph(color, [options], [callback]); // use '#rrggbb' format
   *
   *     morph(color_name, [options], [callback]); // use 'random', 'red', 'green', 'yellow' and other CSS supported names
   *
   * Options can contain the following parameters for object:
   *
   * - channel=0: Channel is represented as 0=R, 1=G, 2=B
   * - index=0: The index of the LED
   * - duration=1000: How long should the morph animation last in milliseconds
   * - steps=50: How many steps for color changes
   * @deprecated Use animation API instead
   */
  async morph(...args: ColorOptions<MorphOptions>) {
    const params = interpretParameters(...args);

    const duration = params.options.duration ?? 1000;
    let steps = params.options.steps;
    if (steps === undefined || steps <= 0 || duration / steps < 17) {
      steps = (duration / 33) | 0; // 33ms is approximately 30 FPS
    }
    const stepDuration = Math.round(duration / steps);

    const [cr, cg, cb] = await this.getColor(params.options.index ?? 0);

    const signal = AbortSignal.any(
      [this.abortController.signal, params.options.signal].filter(isDefined),
    );

    for (let count = 0; count < steps; count++) {
      const nextRed = clampRgb(cr + ((params.r - cr) / steps) * count);
      const nextGreen = clampRgb(cg + ((params.g - cg) / steps) * count);
      const nextBlue = clampRgb(cb + ((params.b - cb) / steps) * count);
      const t0 = performance.now();
      await this.setColor(nextRed, nextGreen, nextBlue, params.options);
      const elapsedTime = performance.now() - t0;
      const sleepTime = stepDuration - elapsedTime;
      if (sleepTime > 0) {
        await setTimeout(sleepTime, null, { signal });
      } else if (this.isSync) {
        // If we are in sync mode, release the event loop to allow other operations
        await scheduler.yield();
      }
    }
  }

  /**
   * Pulses specified RGB color.
   *
   * Function supports the following overloads:
   *
   * @example
   *     //Available overloads
   *     pulse(red, green, blue, [options], [callback]); // use [0..255] ranges for intensity
   *
   *     pulse(color, [options], [callback]); // use '#rrggbb' format
   *
   *     pulse(color_name, [options], [callback]); // use 'random', 'red', 'green', 'yellow' and other CSS supported names
   *
   * Options can contain the following parameters for object:
   *
   * - channel=0: Channel is represented as 0=R, 1=G, 2=B
   * - index=0: The index of the LED
   * - duration=1000: How long should the pulse animation last in milliseconds (this time is actually doubled, keeping it in-line with legacy behavior)
   * - steps=50: How many steps for color changes
   * @deprecated Use animation API instead
   */
  async pulse(...options: ColorOptions<MorphOptions>) {
    const params = interpretParameters(...options);

    await this.morph(params.r, params.g, params.b, params.options);
    await this.morph(0, 0, 0, params.options);
  }

  /**
   * Get a feature report from the device, retrying if necessary.
   *
   * @param {Number} reportId Report ID to receive
   * @param {Number} length Expected length of the report
   * @param {Number} maxRetries Maximum number of retries
   */
  async getFeatureReport(
    reportId: number,
    length: number,
    maxRetries: number = this.defaultRetryCount,
  ): Promise<Buffer> {
    return retryNTimes(maxRetries, async () => this.getFeatureReportRaw(reportId, length));
  }

  /**
   * Gets a feature report from the device without retries.
   * @param reportId
   * @param length
   */
  async getFeatureReportRaw(reportId: number, length: number): Promise<Buffer> {
    return asBuffer(await this.device.getFeatureReport(reportId, length));
  }

  /**
   * Gets API to control all LEDs on the device.
   */
  public leds(): LedGroup {
    return new LedGroup(this);
  }

  /**
   * Gets API to control a single LED on the device.
   * @param index
   */
  public led(index: number): Led {
    assert(index >= 0, 'Index must be greater than 0');
    assert(index < this.ledCount, 'Index must be less than ledCount');

    return new Led(this, index);
  }

  public getTransport(): Transport {
    return this.device;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlinkstickAny = BlinkStick<any>;
