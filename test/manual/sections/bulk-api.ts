import { BlinkstickAny } from '../../../src';
import { yesOrThrow } from '../helpers';
import { RgbTuple } from '../../../src/types/rgb-tuple';
import { SectionDefinition } from '../sections';

export function bulkApi(blinkstickDevice: BlinkstickAny): Record<string, SectionDefinition> {
  if (blinkstickDevice.ledCount < 2) {
    console.log('This device does not support bulk API');
    return {};
  }

  const ret: Record<string, any> = {};

  const colors: Record<string, RgbTuple> = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
  };

  for (const [color, tuple] of Object.entries(colors)) {
    ret[`Set all LEDs to ${color}`] = {
      enabled: true,
      test: async () => {
        console.log(`Now we will use bulk mode to set all LEDs to ${color}.`);

        await blinkstickDevice.leds().setColor(tuple);
        await yesOrThrow(`Are all LEDs ${color}?`, `All LEDs should be ${color}`);
      },
    };
  }

  return ret;
}
