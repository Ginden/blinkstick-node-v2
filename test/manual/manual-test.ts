import prompts from 'prompts';
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
import { reportIssueUrl, yesOrThrow } from './helpers';
import { sections } from './sections';
import { br, hr } from './print';

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

  const { sectionsEnabled }: { sectionsEnabled: { name: string; fn: Function }[] } = await prompts({
    message: `Select sections to test`,
    type: 'multiselect',
    name: 'sectionsEnabled',
    choices: Object.entries(sections).map(([title, value]) => ({
      title: title,
      value: { name: title, fn: value },
      selected: true,
    })),
  });

  for (const { name, fn } of sectionsEnabled) {
    console.log(`First, we will turn off all LEDs.`);
    await blinkstickDevice.turnOffAll();
    console.log(`Now we will run ${name} tests.`);
    await fn(blinkstickDevice);
    br();
    hr();
    br();
  }
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
        infoBlock1: (await blinkstickDevice?.getInfoBlock1())?.toString('hex'),
        infoBlock2: (await blinkstickDevice?.getInfoBlock2())?.toString('hex'),
        inverse: blinkstickDevice?.inverse,
        requiresSoftwarePatch: blinkstickDevice?.requiresSoftwareColorPatch,
        version: {
          major: blinkstickDevice?.versionMajor ?? null,
          minor: blinkstickDevice?.versionMinor ?? null,
        },
      },
    };

    await writeFile(`manual-test.log`, JSON.stringify(ret, null, 2));

    process.exit(1);
  })
  .catch((err: unknown) => {
    setImmediate(() => {
      throw err;
    });
  });
