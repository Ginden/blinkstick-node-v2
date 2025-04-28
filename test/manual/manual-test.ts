import prompts from 'prompts';
import blinkstick, { BlinkStick, createBlinkstickAsync } from '../../src';
import { assert } from 'tsafe';
import { Device, HIDAsync } from 'node-hid';
import { writeFile } from 'node:fs/promises';
import { retryNTimes } from '../../src/utils/retry-n-times';

const reportIssueUrl = `https://github.com/Ginden/blinkstick-node-v2/issues/new`;

const questionsAsked: { question: string; result }[] = [];

async function yesOrThrow(question: string, errorMsg: string = 'User did not confirm') {
  const { yes } = await prompts({
    type: 'toggle',
    name: 'yes',
    message: question,
    initial: Math.random() > 0.5,
    active: 'yes',
    inactive: 'no',
  });

  questionsAsked.push({ question, result: yes });

  assert(yes, `${errorMsg}. Please report a bug at ${reportIssueUrl}.`);
}

let blinkstickDevice: BlinkStick<HIDAsync> | null = null;
let device: Device | null = null;

(async () => {
  const devices = await blinkstick.findRawDevicesAsync();
  assert(devices.length > 0, 'No devices found');
  const selectedDevice =
    devices.length === 1
      ? { device: devices[0]! }
      : await prompts({
          type: 'select',
          name: 'device',
          message: 'Select a device',
          choices: devices.map((device) => ({
            title: `${device.product} at ${device.path}`,
            value: device,
          })),
        });
  console.log(`Selected device: ${selectedDevice.device.product} at ${selectedDevice.device.path}`);
  assert(selectedDevice.device, 'No device selected');

  device = selectedDevice.device;

  blinkstickDevice = await createBlinkstickAsync(selectedDevice.device);
  assert(blinkstickDevice);

  const deviceDescription = blinkstickDevice.describeDevice();

  assert(
    deviceDescription !== null,
    'Library do not provide a description for this device. Create Pull Request to add it.',
  );

  const { ledCount } = deviceDescription;

  console.log(`Now we will disable all (${ledCount}) LEDS on the device.`);
  await blinkstickDevice.turnOffAll();
  await yesOrThrow('Are all LEDs off?', 'All LEDs are should be off');

  console.log('Now we will turn on the first LED to blue.');
  await blinkstickDevice.setColor('rgb(0, 0, 255)', { index: 0 });
  await yesOrThrow('Is the first LED blue?', 'First LED should be blue');

  if (ledCount > 1) {
    console.log('Now we will turn on the first two LEDs to red and green.');

    await Promise.all([
      blinkstickDevice.setColor('red', { index: 0 }),
      blinkstickDevice.setColor('green', { index: 1 }),
    ]);
    await yesOrThrow(
      'Are the first two LEDs red and green?',
      'First two LEDs should be red and green',
    );
    await blinkstickDevice.turnOffAll();

    console.log(
      `Now we will pulse both LEDs as yellow and blue for 2 seconds. Yellow one will be pulsing much faster than the other.`,
    );

    await Promise.all([
      retryNTimes(10, async () => {
        await blinkstickDevice!.pulse('yellow', { index: 0, duration: 200 });
        throw new Error('Bunk');
      }),
      retryNTimes(20, async () => {
        await blinkstickDevice!.pulse('blue', { index: 1, duration: 100 });
        throw new Error('Bunk');
      }),
    ]).catch(() => null);

    await yesOrThrow(
      `Was the first LED pulsing yellow and the second blue?`,
      'First LED should be yellow and the second blue',
    );
  }
})()
  .then(() => {
    console.log('Test completed successfully');
    return process.exit(0);
  })
  .catch(async (err: any) => {
    console.error(`Test failed. All details will be saved in manual-test.log at repository root`);
    console.error(`Consider creating an issue at ${reportIssueUrl}`);

    const ret = {
      error: Object.fromEntries(Object.entries(err)),
      device,
      questionsAsked,
      blinkstick: {
        describeDevice: blinkstickDevice?.describeDevice(),
        infoBlock1: await blinkstickDevice?.getInfoBlock1(),
        infoBlock2: await blinkstickDevice?.getInfoBlock2(),
        inverse: blinkstickDevice?.inverse,
        animation: blinkstickDevice?.animationsEnabled,
        requiresSoftwarePatch: blinkstickDevice?.requiresSoftwareColorPatch,
        version: {
          major: blinkstickDevice?.getVersionMajor(),
          minor: blinkstickDevice?.getVersionMinor(),
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
