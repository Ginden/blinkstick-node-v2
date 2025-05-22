import { BlinkstickAny } from '../../../src';
import { retryNTimes } from '../../../src/utils/retry-n-times';
import { yesOrThrow } from '../helpers';

export async function legacyAnimations(blinkstickDevice: BlinkstickAny) {
  const { ledCount } = blinkstickDevice;

  console.log(`Now we will pulse the first LED as green for 2 seconds.`);
  await retryNTimes(10, async () => {
    await blinkstickDevice!.pulse('green', { index: 0, duration: 200 });
    throw new Error('Bunk');
  }).catch(() => null);
  await yesOrThrow(`Was the first LED pulsing green?`, 'First LED should be green');

  await blinkstickDevice!.turnOffAll();

  console.log(`Now we will morph the first LED from white to blue over 2 seconds.`);
  await blinkstickDevice.setColor(255, 255, 255, { index: 0 });
  await blinkstickDevice.morph('blue', { index: 0, duration: 2000, steps: 32 });
  await yesOrThrow(`Did first LED morph to blue?`, 'First LED should have morphed to blue');

  if (ledCount > 1) {
    console.log(
      `Now we will pulse both LEDs as yellow and blue for 2 seconds. Yellow one will be pulsing much faster than the other.`,
    );

    await Promise.allSettled([
      retryNTimes(10, async () => {
        await blinkstickDevice!.pulse('yellow', { index: 0, duration: 200 });
        throw new Error('Bunk');
      }),
      retryNTimes(20, async () => {
        await blinkstickDevice!.pulse('blue', { index: 1, duration: 100 });
        throw new Error('Bunk');
      }),
    ]);
    await blinkstickDevice.turnOffAll();

    await yesOrThrow(
      `Was the first LED pulsing yellow and the second blue?`,
      'First LED should be yellow and the second blue',
    );
  }
}
