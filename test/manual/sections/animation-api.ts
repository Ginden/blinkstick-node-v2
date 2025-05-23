import { assert } from 'tsafe';
import {
  asyncCollect,
  BlinkstickAny,
  ComplexFrame,
  RgbTuple,
  SimpleFrame,
  wrapGeneratorForAnimation,
} from '../../../src';
import { yesOrThrow } from '../helpers';
import { Animation } from '../../../src/animations/animation-description';
import { AnimationBuilder } from '../../../src/animations/animation-builder';
import { assertAnimationLength } from '../assert-animation-length';

export async function animationApi(blinkstickDevice: BlinkstickAny) {
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
    assertAnimationLength(elapsedTime, expectedTime);
    await yesOrThrow('Did all LEDs go through the rainbow?', 'All LEDs should be rainbow colored');
  }

  // Morph
  {
    const singleDuration = 300;
    console.log(
      `🌈 Now we will use animation API to morph the color of all LEDs going through the rainbow. This should take ${rainbowRgbs.length * singleDuration}ms.`,
    );
    const t0 = Date.now();
    const expectedDuration = rainbowRgbs.length * singleDuration;
    await animationRunner.run(Animation.morphMany(rainbowRgbs, expectedDuration));
    const elapsedTime = Date.now() - t0;

    assertAnimationLength(elapsedTime, expectedDuration);

    await yesOrThrow('Did all LEDs go through the rainbow?', 'All LEDs should be rainbow colored');
  }

  {
    const singleDuration = 300;
    const iterations = 10;
    const getRandomRainbowColor = () => rainbowRgbs[Math.floor(Math.random() * rainbowRgbs.length)];
    const iterator = wrapGeneratorForAnimation(function* () {
      for (let i = 0; i < iterations; i++) {
        const tuples = Array.from({ length: blinkstickDevice.ledCount }, () =>
          getRandomRainbowColor(),
        );
        yield new ComplexFrame(tuples, singleDuration);
      }
    });

    console.log(
      `🌈 Now we will use animation API to change the color of all LEDs going through the rainbow, but independently. This should take ${iterations * singleDuration}ms.`,
    );

    const t0 = Date.now();

    await blinkstickDevice.animation.run(iterator);
    const elapsedTime = Date.now() - t0;
    await blinkstickDevice.turnOffAll();

    assertAnimationLength(elapsedTime, iterations * singleDuration);

    await yesOrThrow(
      'Were LEDs blinking independently?',
      'All LEDs should be blinking independently',
    );
  }

  // AnimationBuilder
  {
    const singleDuration = 500;

    const duration = singleDuration * 10;
    console.log(
      `🌈 Now we will use animation API to run a complex animation. This should take ${duration}ms.`,
    );

    const animation = AnimationBuilder.startWithBlack(50)
      .addPulse('red', singleDuration)
      .addPulse('green', singleDuration)
      .addPulse('blue', singleDuration)
      .addStaticFrame(SimpleFrame.colorAndDuration('lightsteelblue', singleDuration))
      .addPulse('red', singleDuration)
      .stillColor('green', singleDuration)
      .morphToColor('blue', singleDuration)
      .morphToColor('black', singleDuration)
      .build();

    const collected = await asyncCollect(animation);

    const t0 = Date.now();
    await animationRunner.run(collected);
    const elapsedTime = Date.now() - t0;
    assertAnimationLength(elapsedTime, duration);
    await yesOrThrow(
      'Did all LEDs go through the complex animation?',
      'All LEDs should be going through the complex animation',
    );

    await blinkstickDevice.turnOffAll();
  }
}
