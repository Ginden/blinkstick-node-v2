import { assert } from 'tsafe';
import { FrameIterable } from '../animation-description';
import { ComplexFrame } from '../frame/complex-frame';
import { SimpleFrame } from '../frame/simple-frame';
import { Frame } from '../frame/frame';
import { WaitFrame } from '../frame/wait-frame';

/**
 * Sets maximum duration for an animation.
 * The last frame can be shortened to fit the maximum duration.
 * Frames beyond the maximum duration are dropped
 */
export function limitDuration(
  animation: FrameIterable,
  maximumDuration: number,
): AsyncIterable<Frame> {
  assert(maximumDuration > 0, 'maximumDuration must be greater than 0');
  return {
    [Symbol.asyncIterator]: async function* (): AsyncGenerator<Frame> {
      let timeTook = 0;
      for await (const frame of animation) {
        if (timeTook >= maximumDuration) {
          return;
        }
        const { duration } = frame;
        if (timeTook + duration > maximumDuration) {
          // If the frame is longer than the remaining time, we need to truncate it.
          if (frame instanceof SimpleFrame) {
            yield new SimpleFrame(frame.rgb, maximumDuration - timeTook);
          } else if (frame instanceof ComplexFrame) {
            yield new ComplexFrame(frame.colors, maximumDuration - timeTook);
          } else {
            yield new WaitFrame(maximumDuration - timeTook);
          }
        } else {
          yield frame;
        }
        timeTook += duration;
      }
    },
  };
}
