import prompts from 'prompts';
import blinkstick, {
  BlinkStick,
  BlinkstickAsync,
  BlinkstickSync,
  createBlinkstickAsync,
  createBlinkstickSync,
} from '../../src';
import { assert } from 'tsafe';
import { Device, HIDAsync } from 'node-hid';
import { writeFile } from 'node:fs/promises';
import { retryNTimes } from '../../src/utils/retry-n-times';
import { questionsAsked } from './questions-asked';
import { reportIssueUrl, yesOrThrow } from './helpers';
import { Entries } from 'type-fest';
import { sections } from './sections';
import { br, hr } from './print';

let blinkstickDevice: BlinkstickAsync | BlinkstickSync | null = null;
let device: Device | null = null;

(async () => {
  const devices = await blinkstick.findRawDevicesAsync();
  assert(devices.length > 0, 'No devices found');
  const selection = await prompts({
    type: 'select',
    name: 'device',
    message: 'Select a device',
    choices: devices
      .map((device) => ({
        title: `${device.product} at ${device.path}`,
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

  const deviceDescription = blinkstickDevice.describeDevice();

  assert(
    deviceDescription !== null,
    `Library do not provide a description for this device (${blinkstickDevice.product}). Create Pull Request to add it.`,
  );

  const { ledCount } = deviceDescription;

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
    await fn(blinkstickDevice, deviceDescription);
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
        describeDevice: blinkstickDevice?.describeDevice(),
        infoBlock1: (await blinkstickDevice?.getInfoBlock1Raw())?.toString('hex'),
        infoBlock2: (await blinkstickDevice?.getInfoBlock2Raw())?.toString('hex'),
        inverse: blinkstickDevice?.inverse,
        animation: blinkstickDevice?.animationsEnabled,
        requiresSoftwarePatch: blinkstickDevice?.requiresSoftwareColorPatch,
        version: {
          major: blinkstickDevice?.getVersionMajor() ?? null,
          minor: blinkstickDevice?.getVersionMinor() ?? null,
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
