import { FrameIterable } from '../animation-description';
import { Frame } from '../frame/frame';

/**
 * Callback function to transform each frame.
 * @category Animation
 */
export type TransformEachFrameCb = (frame: Frame) => Frame;

/**
 * Applies a transformation to each frame in the animation.
 * This is very advanced feature and should be used with caution.
 * @param frames
 * @param transform
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
