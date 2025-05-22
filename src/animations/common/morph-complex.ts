import assert from 'assert';
import { AnimationDescription } from '../animation-description';
import { Frame } from '../frame';
import { ComplexFrame } from '../complex-frame';
import { SimpleFrame } from '../simple-frame';
import { NullFrame } from '../null-frame';
import { morph } from './morph';
import { clampRgb } from '../../utils';
import { RgbTuple } from '../../types';

/**
 * Morphs between two complex frames.
 */
export function morphBetweenComplexFrames(
  firstFrameAsComplexFrame: ComplexFrame,
  lastFrameAsComplexFrame: ComplexFrame,
  overMs: number,
  steps: number,
): Iterable<ComplexFrame> {
  assert(steps > 0, 'Steps must be greater than 0');
  return {
    *[Symbol.iterator]() {
      const firstFrame = firstFrameAsComplexFrame.colors;
      const lastFrame = lastFrameAsComplexFrame.colors;
      const stepDuration = overMs / steps;

      for (let i = 0; i < steps; i++) {
        const progress = (i + 1) / (steps + 1);

        const colors = firstFrame.map((color, ledIndex) => {
          return color.map((component, componentIndex) => {
            const start = component;
            const end = lastFrame[ledIndex][componentIndex];
            const interpolated = start + progress * (end - start);
            return clampRgb(interpolated);
          }) as RgbTuple;
        });

        yield new ComplexFrame(colors, stepDuration);
      }
    },
  };
}

/**
 * Smooth transition between two animations.
 * @param source
 * @param target
 * @param overMs
 * @param steps
 */
export function morphComplex(
  source: AnimationDescription,
  target: AnimationDescription,
  overMs: number,
  steps = 100,
): AsyncIterable<Frame> {
  assert(steps > 0, 'Steps must be greater than 0');
  return {
    [Symbol.asyncIterator]: async function* () {
      let lastSourceFrame: SimpleFrame | ComplexFrame | undefined = undefined;
      for await (const frame of source) {
        yield frame;
        if (frame instanceof NullFrame) {
          continue;
        }
        lastSourceFrame = frame;
      }
      assert(lastSourceFrame, 'Source animation is empty');
      const targetAsGenerator = (async function* () {
        yield* target;
      })();

      const { value: firstTargetFrame } = await targetAsGenerator.next();
      assert(firstTargetFrame, 'Target animation is empty');
      // MORPH LOGIC HERE
      if (firstTargetFrame instanceof NullFrame) {
        throw new Error('Cannot morph to a NullFrame');
      }
      // Give me pattern matching plz
      if (firstTargetFrame instanceof SimpleFrame && lastSourceFrame instanceof SimpleFrame) {
        console.log(`morph`, {
          from: firstTargetFrame.rgb,
          to: lastSourceFrame.rgb,
          overMs,
          steps,
        });
        yield* morph(firstTargetFrame.rgb, lastSourceFrame.rgb, overMs, steps);
      } else {
        const ledCount = [firstTargetFrame, lastSourceFrame]
          .filter<ComplexFrame>((v) => v instanceof ComplexFrame)
          .pop()!.colors.length;
        const firstFrameAsComplexFrame: ComplexFrame =
          firstTargetFrame instanceof ComplexFrame
            ? firstTargetFrame
            : ComplexFrame.fromSimpleFrame(firstTargetFrame, ledCount);
        const lastFrameAsComplexFrame: ComplexFrame =
          lastSourceFrame instanceof ComplexFrame
            ? lastSourceFrame
            : ComplexFrame.fromSimpleFrame(lastSourceFrame, ledCount);

        yield* morphBetweenComplexFrames(
          firstFrameAsComplexFrame,
          lastFrameAsComplexFrame,
          overMs,
          steps,
        );
      }

      yield firstTargetFrame;
      for await (const frame of targetAsGenerator) {
        yield frame;
      }
    },
  };
}
