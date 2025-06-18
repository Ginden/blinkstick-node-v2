import { BlinkstickAny } from '../../../src';
import { yesOrThrow } from '../helpers';
import { SectionDefinition } from '../sections';

export function basicQuestions(blinkstickDevice: BlinkstickAny): Record<string, SectionDefinition> {
  const { ledCount } = blinkstickDevice;

  return {
    'Turn on first LED to blue': {
      enabled: true,
      test: async () => {
        console.log('🟦 Now we will turn on the first LED to blue.');
        await blinkstickDevice.setColor(0, 0, 255, { index: 0 });
        await yesOrThrow('Is the first LED blue?', 'First LED should be blue');
      },
    },
    'Blue and green LEDs': {
      enabled: ledCount > 1,
      test: async () => {
        console.log('🟥🟩 Now we will turn on the first two LEDs to red and green.');

        await Promise.all([
          blinkstickDevice.setColor('red', { index: 0 }),
          blinkstickDevice.setColor('green', { index: 1 }),
        ]);
        await yesOrThrow(
          'Are the first two LEDs red and green?',
          'First two LEDs should be red and green',
        );
      },
    },
    'Multi-LEDs': {
      enabled: ledCount > 2,
      test: async () => {
        const colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta'].sort(
          () => Math.random() - 0.5,
        );
        console.log(
          `🟥🟩🟦🟨🟦🟪 Now we will turn on the first ${ledCount} LEDs to a rainbow of colors.`,
        );
        await Promise.all(
          Array.from({ length: ledCount }, (_, i) => {
            const color = colors[i % colors.length];
            return blinkstickDevice.setColor(color, { index: i });
          }),
        );
        await yesOrThrow(
          `Are the first ${ledCount} LEDs set to a rainbow of colors?`,
          `First ${ledCount} LEDs should be set to a rainbow of colors`,
        );
      },
    },
  };
}
