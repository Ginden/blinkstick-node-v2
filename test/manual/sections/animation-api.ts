import { assert } from 'tsafe';
import { BlinkstickAny, BlinkstickDeviceDefinition, RgbTuple, SimpleFrame } from '../../../src';
import { yesOrThrow } from '../helpers';
import { Animation } from '../../../src/animations/animation-description';

export async function animationApi(
  blinkstickDevice: BlinkstickAny,
  { ledCount }: BlinkstickDeviceDefinition,
) {
  const animationRunner = blinkstickDevice.animation;
  assert(animationRunner, 'Animation runner should be defined');
  const rainbowRgbs: RgbTuple[] = [
    [255, 0, 0],
    [255, 127, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 0, 255],
    [75, 0, 130],
    [148, 0, 211],
    [0, 0, 0],
  ];
  // Quick switch
  {
    const singleDuration = 300;

    const expectedTime = singleDuration * rainbowRgbs.length;
    console.log(
      `🌈 Now we will use animation API to change the color of all LEDs going through the rainbow. This should take ${expectedTime}ms.`,
    );

    const time = Date.now();
    await animationRunner.run(rainbowRgbs.map((rgb) => new SimpleFrame(rgb, singleDuration)));
    const elapsedTime = Date.now() - time;
    assert(
      elapsedTime >= expectedTime - 50,
      `Animation should take at least ${expectedTime}ms, but took ${elapsedTime}ms`,
    );
    console.log(
      `Animation took ${elapsedTime - expectedTime}ms $(${((100 * elapsedTime) / expectedTime - 100).toFixed(1)}% of expected value)`,
    );
    await yesOrThrow('Did all LEDs go through the rainbow?', 'All LEDs should be rainbow colored');
  }

  // Morph
  {
    const singleDuration = 300;
    console.log(
      `🌈 Now we will use animation API to morph the color of all LEDs going through the rainbow. This should take ${rainbowRgbs.length * singleDuration}ms.`,
    );
    await animationRunner.run(Animation.morphMany(rainbowRgbs, rainbowRgbs.length * 350));
    await yesOrThrow('Did all LEDs go through the rainbow?', 'All LEDs should be rainbow colored');
  }
}
