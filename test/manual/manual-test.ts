import prompts, { Choice } from 'prompts';
import {
  findRawDevicesAsync,
  BlinkstickAsync,
  BlinkstickSync,
  createBlinkstickAsync,
  createBlinkstickSync,
  attemptToGetDeviceDescription,
} from '../../src';
import { assert } from 'tsafe';
import { Device } from 'node-hid';
import { writeFile } from 'node:fs/promises';
import { questionsAsked } from './questions-asked';
import { reportIssueUrl, settle, yesOrThrow } from './helpers';
import { SectionDefinition, SectionFn, sections } from './sections';
import { br, hr } from './print';
import { benchmarkFps } from './benchmark-fps';
import { asBuffer } from '../../src/utils';

let blinkstickDevice: BlinkstickAsync | BlinkstickSync | null = null;
let device: Device | null = null;

(async () => {
  const devices = await findRawDevicesAsync();
  assert(devices.length > 0, 'No devices found');
  const selection = await prompts({
    type: 'select',
    name: 'device',
    message: 'Select a device',
    choices: devices
      .map((device) => ({
        title: `${attemptToGetDeviceDescription(device)?.name ?? device.product} at ${device.path}`,
        value: device,
      }))
      .flatMap(({ title, value: device }) => [
        {
          title: `${title} (async mode)`,
          value: {
            title: `${title} (async mode)`,
            device,
            async: true,
          },
        },
        {
          title: `${title} (sync mode)`,
          value: {
            title: `${title} (async mode)`,
            device,
            async: false,
          },
        },
      ]),
  });
  const selectedDeviceOption = selection.device;
  const { device: selectedDevice, title, async } = selectedDeviceOption;

  const selectedMode = async ? 'async' : 'sync';

  console.log(`Selected device: ${title}`);
  assert(selectedDevice, 'No device selected');

  device = selectedDevice;

  blinkstickDevice =
    selectedMode === 'async'
      ? await createBlinkstickAsync(selectedDevice)
      : createBlinkstickSync(selectedDevice);

  assert(blinkstickDevice);

  const { ledCount } = blinkstickDevice;

  console.log(`Now we will disable all (${ledCount}) LEDS on the device.`);
  await blinkstickDevice.turnOffAll();
  await yesOrThrow('Are all LEDs off?', 'All LEDs are should be off');

  const { sectionsEnabled }: { sectionsEnabled: { name: string; fn: SectionFn }[] } = await prompts(
    {
      message: `Select sections to test`,
      type: 'multiselect',
      name: 'sectionsEnabled',
      choices: Object.entries(sections).map(([title, value]) => ({
        title: title,
        value: { name: title, fn: value },
        selected: true,
      })),
    },
  );

  for (const { name, fn } of sectionsEnabled) {
    br();
    console.log(`➡️ Running section: ${name}`);
    const section = fn(blinkstickDevice, blinkstickDevice.deviceDescription!);
    const subSectionChoices = Object.entries(section).map(([title, { test, enabled }]) => {
      return {
        title,
        value: {
          title,
          enabled,
          test,
        },
        selected: enabled,
      } as const satisfies Choice;
    });

    const { subSectionsEnabled }: { subSectionsEnabled: { title: string; test: Function }[] } =
      await prompts({
        message: `Select sections to test`,
        type: 'multiselect',
        name: 'subSectionsEnabled',
        choices: subSectionChoices,
      });

    for (const { test, title } of subSectionsEnabled) {
      br();
      console.log(`➡️ Running sub-section: ${title}`);
      await test();
      br();
    }

    br();
    hr();
    br();
  }

  await yesOrThrow(`Was everything all right?`, 'User did not confirm to throw an error', true);
})()
  .finally(() => {
    return blinkstickDevice?.turnOffAll();
  })
  .then(() => {
    console.log('Test completed successfully');
    return process.exit(0);
  })
  .catch(async (err: any) => {
    console.error(err);
    console.error(`Test failed. All details will be saved in manual-test.log at repository root`);
    console.error(`Consider creating an issue at ${reportIssueUrl}`);

    const bufferConvert = (v: Buffer | Uint8Array | number[] | undefined) =>
      v ? { type: 'buffer', data: asBuffer(v).toString('hex'), length: v.length } : null;

    const ret = {
      error: Object.fromEntries(Object.entries(err).concat([['stack', err.stack]])),
      device,
      questionsAsked,
      blinkstick: {
        ledCount: blinkstickDevice?.ledCount,
        manufacturer: blinkstickDevice?.manufacturer,
        product: blinkstickDevice?.product,
        isSync: blinkstickDevice?.isSync,
        serial: blinkstickDevice?.serial,
        infoBlock1: await settle(blinkstickDevice?.getInfoBlock1(), bufferConvert),
        infoBlock2: await settle(blinkstickDevice?.getInfoBlock2(), bufferConvert),
        deviceLedCount: await settle(blinkstickDevice?.getLedCountFromDevice()),
        mode: await settle(blinkstickDevice?.getMode()),
        colors: await settle(blinkstickDevice?.getColors(blinkstickDevice.ledCount), bufferConvert),
        inverse: blinkstickDevice?.inverse,
        requiresSoftwarePatch: blinkstickDevice?.requiresSoftwareColorPatch,
        version: {
          major: blinkstickDevice?.versionMajor ?? null,
          minor: blinkstickDevice?.versionMinor ?? null,
        },
        fpsBenchmark: blinkstickDevice ? await settle(benchmarkFps(blinkstickDevice)) : null,
      },
    };

    await writeFile(
      `manual-test.log`,
      JSON.stringify(
        ret,
        (k, v) => {
          if (v instanceof Error) {
            return {
              ...v,
              name: v.name,
              message: v.message,
              stack: v.stack,
            };
          }
          if (v instanceof Buffer) {
            return {
              type: 'Buffer',
              length: v.length,
              data: v.toString('hex'),
            };
          }
          if (v instanceof Uint8Array) {
            return {
              type: 'Uint8Array',
              length: v.length,
              data: Buffer.from(v).toString('hex'),
            };
          }
          return v;
        },
        2,
      ),
    );

    process.exit(1);
  })
  .catch((err: unknown) => {
    setImmediate(() => {
      throw err;
    });
  });
