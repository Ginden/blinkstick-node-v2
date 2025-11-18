import type { FrameIterable } from '../animation-description';
import type { Frame } from '../frame/frame';

/**
 * @summary Callback function to transform each frame.
 * @category Animation
 */
export type TransformEachFrameCb = (frame: Frame) => Frame;

/**
 * @summary Applies a transformation to each frame in the animation.
 * @remarks This is very advanced feature and should be used with caution.
 * @category Animation
 */
export function transformEachFrame(
  frames: FrameIterable,
  transform: TransformEachFrameCb,
): AsyncIterable<Frame> {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const frame of frames) {
        yield transform(frame);
      }
    },
  } as AsyncIterable<Frame>;
}
