import { Device, HID, HIDAsync } from 'node-hid';
import { determineReportId } from './utils/hid/determine-report-id';
import { decimalToHex } from './utils/decimal-to-hex';
import { getInfoBlock, getInfoBlockRaw } from './utils/hid/get-info-block';
import { setInfoBlock } from './utils/hid/set-info-block';
import { ColorOptions, NormalizedColorOptions } from './types/color-options';
import { clampRgb } from './utils/clamp';
import { setTimeout } from 'timers/promises';
import { blinkstickFinalizationRegistry } from './blinkstick-finalization-registry';
import { MorphOptions } from './color-change-options/morph-options';
import { SetColorOptions } from './color-change-options/set-color-options';
import { retryNTimes } from './utils/retry-n-times';
import { Channel } from './types/channel';
import {
  interpretParameters,
  interpretParametersInversed,
} from './utils/colors/interpret-parameters';
import { BlinkStickProMode } from './types/mode';
import { BlinkstickDeviceDefinition, blinkstickDevicesDefinitions } from './definitions/devices';
import { isDefined } from './utils/is-defined';
import { AnimationRunner } from './animations/animation-runner';
import { LedGroup } from './led/led-group';
import { asBuffer } from './as-buffer';
import { Led } from './led/led';
import { RgbTuple } from './types/rgb-tuple';

/**
 * Main class responsible for controlling BlinkStick devices.
 */
export abstract class BlinkStick<HidDevice extends HID | HIDAsync> {
  public abstract readonly isSync: boolean;
  private abortSignal: AbortSignal | null = null;
  /**
   * Changes the default retry count for sending feature reports.
   * Yes - it is buggy.
   */
  public defaultRetryCount = 5;
  public animationsEnabled: boolean;
  readonly requiresSoftwareColorPatch: boolean;
  readonly device: HidDevice;
  readonly serial: string;
  readonly manufacturer: string;
  readonly product: string;
  protected _animation?: AnimationRunner;
  protected _inverse = false;

  public interpretParameters: typeof interpretParameters = interpretParameters;

  /**
   *
   * @internal This is not intended to be used outside of the library. End-users should use `find*` functions
   */
  protected constructor(device: HidDevice, deviceInfo: Device) {
    this.device = device;
    this.serial = deviceInfo.serialNumber ?? '';
    this.manufacturer = deviceInfo.manufacturer ?? '';
    this.product = deviceInfo.product ?? '';

    this.animationsEnabled = true;

    this.requiresSoftwareColorPatch =
      this.getVersionMajor() == 1 && this.getVersionMinor() >= 1 && this.getVersionMinor() <= 3;
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
    if (this.describeDevice()?.ledCount) {
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
    return await this.device.sendFeatureReport(data);
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
    this.stop();
    await this.device.close();
  }

  /**
   * Stop all animations
   */
  stop() {
    this.animationsEnabled = false;
    return this;
  }

  enableAnimations() {
    this.animationsEnabled = true;
    return this;
  }

  /**
   * Get the major version from serial number
   *
   * @return Major version number from serial
   */
  getVersionMajor(): number {
    return parseInt(this.serial.substring(this.serial.length - 3, this.serial.length - 2));
  }

  /**
   * Get the minor version from serial number
   *
   * @return Minor version number from serial
   */
  getVersionMinor(): number {
    return parseInt(this.serial.substring(this.serial.length - 1, this.serial.length));
  }

  /**
   * Get the manufacturer of the device
   * @deprecated Use `.manufacturer` directly
   */
  getManufacturer() {
    return this.manufacturer;
  }

  /**
   * Get the description of the device
   * @deprecated Use `.product` directly
   */
  getDescription() {
    return this.product;
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
  async setColor(...options: ColorOptions<SetColorOptions>): Promise<Buffer | null> {
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
      return null;
    } else {
      return asBuffer(await this.sendColor(params));
    }
  }

  async setColorAndForget(...options: ColorOptions<SetColorOptions>) {
    await this.sendColorAndForget(interpretParameters(...options));
  }

  private async sendColor(params: NormalizedColorOptions) {
    const {
      r,
      g,
      b,
      options: { channel = 0, index = 0 },
    } = params;
    if (params.options.channel === 0 && params.options.index === 0) {
      return await this.setFeatureReport(1, Buffer.from([1, r, g, b]));
    } else {
      return await this.setFeatureReport(5, Buffer.from([5, channel, index, r, g, b]));
    }
  }

  private async sendColorAndForget(params: NormalizedColorOptions) {
    const {
      r,
      g,
      b,
      options: { channel = 0, index = 0 },
    } = params;
    if (channel === 0 && index === 0) {
      return await this.setFeatureReportAndForget(Buffer.from([1, r, g, b]));
    } else {
      return await this.setFeatureReportAndForget(Buffer.from([5, channel, index, r, g, b]));
    }
  }

  /**
   * Set inverse mode for IKEA DIODER in conjunction with BlinkStick v1.0
   *
   * @param {Boolean} inverse Set true for inverse mode and false otherwise
   */
  setInverse(inverse: boolean) {
    this.inverse = inverse;
  }

  getInverse() {
    return this.inverse;
  }

  /**
   * Set mode for BlinkStick Pro
   *
   * - 0 = Normal
   * - 1 = Inverse
   * - 2 = WS2812
   *
   * You can read more about BlinkStick modes by following this link:
   *
   * http://www.blinkstick.com/help/tutorials/blinkstick-pro-modes
   */
  async setMode(mode: BlinkStickProMode) {
    return asBuffer(await this.setFeatureReport(0x0004, asBuffer([4, mode])));
  }

  async getMode() {
    return asBuffer(await this.getFeatureReport(4, 33));
  }

  async setRandomColor() {
    return await this.setColor('random');
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
   * @param channel Channel is represented as 0=R, 1=G, 2=B
   * @param data LED data in the following format: [g0, r0, b0, g1, r1, b1...]
   */
  async setColors(channel: Channel, data: number[] | Uint8Array | Buffer) {
    const { reportId, maxLeds } = determineReportId(data.length);
    const maxDataBytes = maxLeds * 3;
    const reportLength = 2 + maxDataBytes;
    const report = Buffer.alloc(reportLength);
    report[0] = reportId;
    report[1] = channel;

    const copyLength = Math.min(data.length, maxDataBytes);
    const source = asBuffer(data);
    source.copy(report, 2, 0, copyLength);

    return await this.setFeatureReport(reportId, asBuffer(report));
  }

  async setColorsAndForget(channel: Channel, data: number[] | Uint8Array | Buffer) {
    const { reportId, maxLeds } = determineReportId(data.length);
    const maxDataBytes = maxLeds * 3;
    const reportLength = 2 + maxDataBytes;
    const report = Buffer.alloc(reportLength);
    report[0] = reportId;
    report[1] = channel;

    const copyLength = Math.min(data.length, maxDataBytes);
    const source = asBuffer(data);
    source.copy(report, 2, 0, copyLength);

    return await this.setFeatureReportAndForget(asBuffer(report));
  }

  /**
   * Get the current color as hex string.
   * @param index The index of the LED, 0 is default
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
   * @deprecated Use `getInfoBlock1Raw` instead
   */
  async getInfoBlock1() {
    return await getInfoBlock(this, 0x0002);
  }

  async getInfoBlock1Raw() {
    return await getInfoBlockRaw(this, 0x0002);
  }

  /**
   * Sets the infoblock1 with specified string.
   * It fills the rest of bytes with zeros.
   *
   * Usage:
   *
   * @example
   *     setInfoBlock1("abcdefg");
   * @param data
   */
  async setInfoBlock1(data: string) {
    return await setInfoBlock(this, 0x0002, data);
  }

  /**
   * Get the infoblock2 of the device.
   * This is a 32 byte array that can contain any data.
   *
   * Usage:
   *
   * @example
   *     getInfoBlock2(function(err, data) {
   *         console.log(data);
   *     });
   *
   * @deprecated Use `getInfoBlock2Raw` instead
   */
  async getInfoBlock2() {
    return await getInfoBlock(this, 0x0003);
  }

  async getInfoBlock2Raw() {
    return await getInfoBlockRaw(this, 0x0003);
  }

  async setInfoBlock2(data: string) {
    return await setInfoBlock(this, 0x0003, data);
  }

  turnOff(index: number = 0) {
    return this.setColor(0, 0, 0, { index });
  }

  async turnOffAll(ledCount: number = this.describeDevice()!.ledCount) {
    await this.leds().setColor([0, 0, 0]);
  }

  async blink(...options: ColorOptions) {
    const params = interpretParameters(...options);
    const abortSignal = AbortSignal.any(
      [this.abortSignal, params.options.signal].filter(isDefined),
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
  async setFeatureReport(
    reportId: number,
    data: Buffer,
    maxRetries: number = this.defaultRetryCount,
  ): Promise<Buffer> {
    return retryNTimes(maxRetries, async () => {
      await this.sendFeatureReport(data);
      return asBuffer(await this.device.getFeatureReport(reportId, data.length));
    });
  }

  /**
   * Set a feature report to the device, and forget about it.
   * @param data
   * @param maxRetries
   */
  async setFeatureReportAndForget(data: Buffer, maxRetries: number = 1) {
    await this.sendFeatureReport(data);
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
    const steps = params.options.steps ?? 50;
    const signal = params.options.signal ?? undefined;
    const stepDuration = Math.round(duration / steps);

    const [cr, cg, cb] = await this.getColor(params.options.index ?? 0);

    for (let count = 0; count < steps; count++) {
      if (!this.animationsEnabled) return;
      const nextRed = clampRgb(cr + ((params.r - cr) / steps) * count);
      const nextGreen = clampRgb(cg + ((params.g - cg) / steps) * count);
      const nextBlue = clampRgb(cb + ((params.b - cb) / steps) * count);
      await this.setColor(nextRed, nextGreen, nextBlue, params.options);
      await setTimeout(stepDuration, null, { signal });
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
   * - duration=1000: How long should the pulse animation last in milliseconds
   * - steps=50: How many steps for color changes
   * @deprecated Use animation API instead
   */
  async pulse(...options: ColorOptions<MorphOptions>) {
    const params = interpretParameters(...options);

    await this.morph(params.r, params.g, params.b, params.options);
    await this.morph(0, 0, 0, params.options);
  }

  /**
   * Get a feature report from the device.
   *
   * @param {Number} reportId Report ID to receive
   * @param {Number} length Expected length of the report
   * @param {Number} maxRetries Maximum number of retries
   */
  async getFeatureReport(
    reportId: number,
    length: number,
    maxRetries: number = 5,
  ): Promise<Buffer> {
    return retryNTimes(maxRetries, async () => this.getFeatureReportRaw(reportId, length));
  }

  async getFeatureReportRaw(reportId: number, length: number): Promise<Buffer> {
    return asBuffer(await this.device.getFeatureReport(reportId, length));
  }

  /**
   * Returns library-defined device description.
   */
  describeDevice(): Readonly<BlinkstickDeviceDefinition> | null {
    return (
      blinkstickDevicesDefinitions[this.product as keyof typeof blinkstickDevicesDefinitions] ??
      null
    );
  }

  public leds(ledCount = this.describeDevice()!.ledCount): LedGroup {
    return new LedGroup(this, ledCount);
  }

  public led(index: number): Led {
    if (index < 0 || index >= this.describeDevice()!.ledCount) {
      throw new Error(
        `Index ${index} is out of bounds. Must be between 0 and ${this.describeDevice()!.ledCount - 1}`,
      );
    }
    return new Led(this, index);
  }
}

export type BlinkstickAny = BlinkStick<HID | HIDAsync>;
