import { assert } from 'tsafe';
import {
  asyncCollect,
  BlinkStick,
  BlinkstickAny,
  ComplexFrame,
  RgbTuple,
  SimpleFrame,
  WaitFrame,
  wave,
  wrapGeneratorForAnimation,
} from '../../../src';
import { yesOrThrow } from '../helpers';
import { Animation } from '../../../src/animations/animation-description';
import { AnimationBuilder } from '../../../src/animations/animation-builder';
import { assertAnimationLength } from '../assert-animation-length';
import * as fs from 'node:fs';
import { SectionDefinition } from '../sections';

export function animationApi(blinkstickDevice: BlinkStick): Record<string, SectionDefinition> {
  const { ledCount } = blinkstickDevice;
  const animationRunner = blinkstickDevice.animation;

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

  return {
    'Quick switch': {
      enabled: true,
      test: async () => {
        assert(animationRunner, 'Animation runner should be defined');

        const singleDuration = 300;

        const expectedTime = singleDuration * rainbowRgbs.length;
        console.log(
          `🌈 Now we will use animation API to change the color of all LEDs going through the rainbow. This should take ${expectedTime}ms.`,
        );

        const time = Date.now();
        await animationRunner.run([rainbowRgbs.map((rgb) => new SimpleFrame(rgb, singleDuration))]);
        const elapsedTime = Date.now() - time;
        assertAnimationLength(elapsedTime, expectedTime);
        await yesOrThrow(
          'Did all LEDs go through the rainbow?',
          'All LEDs should be rainbow colored',
        );
      },
    },
    Morph: {
      enabled: true,
      test: async () => {
        assert(animationRunner, 'Animation runner should be defined');
        const singleDuration = 300;
        console.log(
          `🌈 Now we will use animation API to morph the color of all LEDs going through the rainbow. This should take ${rainbowRgbs.length * singleDuration}ms.`,
        );
        const t0 = Date.now();
        const expectedDuration = rainbowRgbs.length * singleDuration;
        await animationRunner.run([Animation.morphMany(rainbowRgbs, expectedDuration)]);
        const elapsedTime = Date.now() - t0;

        assertAnimationLength(elapsedTime, expectedDuration);

        await yesOrThrow(
          'Did all LEDs go through the rainbow?',
          'All LEDs should be rainbow colored',
        );
      },
    },
    Wave: {
      enabled: ledCount > 4,
      test: async () => {
        assert(animationRunner, 'Animation runner should be defined');
        console.log(
          `🌊 This device has more than 4 LEDs, so we can test the wave animation helper.`,
        );
        const waveDelay = 300;
        const morphDuration = 600;
        const singleLedWave = (await asyncCollect(
          AnimationBuilder.startWithBlack(0)
            .morphToColor('cyan', morphDuration)
            .morphToColor('green', morphDuration)
            .morphToColor('black', morphDuration)
            .build(),
        )) as SimpleFrame[];

        const singleAnimationDuration = singleLedWave.reduce(
          (acc, frame) => acc + frame.duration,
          0,
        );

        const multiLedWave = wave(singleLedWave, {
          lagMs: waveDelay,
          fillWith: [0, 0, 0],
          ledCount: blinkstickDevice.ledCount,
        });

        const multiLedWaveFrames = await asyncCollect(multiLedWave);
        const multiLedWaveDuration = multiLedWaveFrames.reduce(
          (acc, frame) => acc + frame.duration,
          0,
        );

        console.log(
          `🌊 Wave animation will take ${multiLedWaveDuration}ms to complete, with each LED changing color every ${waveDelay}ms.`,
        );

        const t0 = Date.now();
        await animationRunner.run([multiLedWave]);

        const elapsedTime = Date.now() - t0;
        const duration = singleAnimationDuration + (blinkstickDevice.ledCount - 1) * waveDelay;
        // Wave helper involves many short frames which incur USB/HID overhead.
        // Allow 20% timing tolerance on real hardware.
        assertAnimationLength(elapsedTime, duration, 0.2);
        await yesOrThrow(
          '🌊 Did all LEDs go through the wave animation?',
          'All LEDs should be going through the wave animation',
        );
      },
    },
    'Complex rainbow animation': {
      enabled: ledCount > 1,
      test: async () => {
        assert(animationRunner, 'Animation runner should be defined');
        const singleDuration = 300;
        const iterations = 10;
        const getRandomRainbowColor = () =>
          rainbowRgbs[Math.floor(Math.random() * rainbowRgbs.length)];
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

        await blinkstickDevice.animation.run([iterator]);
        const elapsedTime = Date.now() - t0;
        await blinkstickDevice.turnOffAll();

        assertAnimationLength(elapsedTime, iterations * singleDuration);

        await yesOrThrow(
          'Were LEDs blinking independently?',
          'All LEDs should be blinking independently',
        );
      },
    },
    'Animation builder': {
      enabled: true,
      test: async () => {
        assert(animationRunner, 'Animation runner should be defined');
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
        await animationRunner.run([collected]);
        const elapsedTime = Date.now() - t0;
        assertAnimationLength(elapsedTime, duration);
        await yesOrThrow(
          'Did all LEDs go through the complex animation?',
          'All LEDs should be going through the complex animation',
        );

        await blinkstickDevice.turnOffAll();
      },
    },
  };
}
