import { BlinkstickAny } from '../../../src';
import { retryNTimes } from '../../../src/utils/retry-n-times';
import { yesOrThrow } from '../helpers';
import { assertAnimationLength } from '../assert-animation-length';
import { SectionDefinition } from '../sections';

export function legacyAnimations(
  blinkstickDevice: BlinkstickAny,
): Record<string, SectionDefinition> {
  const { ledCount } = blinkstickDevice;

  return {
    'Pulse first LED as green': {
      enabled: true,
      test: async () => {
        console.log(`Now we will pulse the first LED as green for 2 seconds.`);
        await retryNTimes(10, async () => {
          await blinkstickDevice!.pulse('green', { index: 0, duration: 200 });
          throw new Error('Bunk');
        }).catch(() => null);
        await yesOrThrow(`Was the first LED pulsing green?`, 'First LED should be green');
      },
    },
    'Morph first LED from white to blue': {
      enabled: true,
      test: async () => {
        console.log(`Now we will morph the first LED from white to blue over 2 seconds.`);
        await blinkstickDevice.setColor(255, 255, 255, { index: 0 });
        const t0 = performance.now();
        await blinkstickDevice.morph('blue', { index: 0, duration: 2000, steps: 32 });
        const elapsedTime = performance.now() - t0;
        assertAnimationLength(elapsedTime, 2000, 0.15);
        await yesOrThrow(`Did first LED morph to blue?`, 'First LED should have morphed to blue');
      },
    },
    'Pulse two LEDs as yellow and blue': {
      enabled: ledCount > 1,
      test: async () => {
        console.log(
          `Now we will pulse both LEDs as yellow and blue for 2 seconds. Yellow one will be pulsing much faster than the other.`,
        );

        const t0 = performance.now();
        const yellowPulse = Array.from(
          { length: 5 },
          () => () => blinkstickDevice!.pulse('yellow', { index: 0, duration: 800 }),
        ).reduce((a, b) => a.then(() => b()), Promise.resolve());
        const bluePulse = Array.from(
          { length: 10 },
          () => () => blinkstickDevice!.pulse('blue', { index: 1, duration: 400 }),
        ).reduce((a, b) => a.then(() => b()), Promise.resolve());

        await Promise.all([yellowPulse, bluePulse]);
        const elapsedTime = performance.now() - t0;
        assertAnimationLength(elapsedTime, 8000, 0.1);
        await blinkstickDevice.turnOffAll();

        await yesOrThrow(
          `Was the first LED pulsing yellow and the second blue?`,
          'First LED should be yellow and the second blue',
        );
      },
    },
  };
}
