import assert from 'assert';
import { FrameIterable } from '../animation-description';
import { Frame } from '../frame/frame';
import { ComplexFrame } from '../frame/complex-frame';
import { SimpleFrame } from '../frame/simple-frame';
import { WaitFrame } from '../frame/wait-frame';
import { morph } from './morph';
import { clampRgb } from '../../utils';
import { RgbTuple } from '../../types';
import { assertFpsBelow100 } from '../helpers/assert-fps-below-100';

/**
 * Morphs between two complex frames.
 */
export function morphBetweenComplexFrames(
  firstFrameAsComplexFrame: ComplexFrame,
  lastFrameAsComplexFrame: ComplexFrame,
  overMs: number,
  stepsRaw?: number,
): Iterable<ComplexFrame> {
  const steps = (stepsRaw ?? overMs / 60) | 0;
  assert(steps > 0, 'Steps must be greater than 0');
  assert(steps * 10 < overMs, 'Frame FPS is too high, please reduce steps or increase overMs');
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
 */
export function morphComplex(
  source: FrameIterable,
  target: FrameIterable,
  overMs: number,
  stepsRaw?: number,
): AsyncIterable<Frame> {
  // Default to ~30 fps to avoid sending excessive number of HID reports on
  // real BlinkStick hardware (USB latency makes >30 fps impractical).
  const steps = (stepsRaw ?? overMs / 33) | 0; // ≈ 30 frames-per-second
  assert(steps > 0, 'Steps must be greater than 0');
  assertFpsBelow100(overMs, steps);
  return {
    [Symbol.asyncIterator]: async function* () {
      let lastSourceFrame: SimpleFrame | ComplexFrame | undefined = undefined;
      for await (const frame of source) {
        yield frame;
        if (frame instanceof WaitFrame) {
          continue;
        }
        lastSourceFrame = frame;
      }
      assert(lastSourceFrame, 'Source animation is empty');

      // We do this, because generator[Symbol.asyncIterator]() === generator - there is no "forking"
      // Therefore, we can take the first frame from the target animation and then yield all other frames
      const targetAsGenerator = (async function* () {
        yield* target;
      })();

      const { value: firstTargetFrame } = await targetAsGenerator.next();
      assert(firstTargetFrame, 'Target animation is empty');
      // MORPH LOGIC HERE
      if (firstTargetFrame instanceof WaitFrame) {
        throw new Error('Cannot morph to a NullFrame');
      }
      // Give me pattern matching plz
      if (firstTargetFrame instanceof SimpleFrame && lastSourceFrame instanceof SimpleFrame) {
        yield* morph(lastSourceFrame.rgb, firstTargetFrame.rgb, overMs, steps);
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

        yield* morphBetweenComplexFrames(firstFrameAsComplexFrame, lastFrameAsComplexFrame, overMs);
      }

      yield firstTargetFrame;
      for await (const frame of targetAsGenerator) {
        yield frame;
      }
    },
  };
}
