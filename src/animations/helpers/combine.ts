import { assert } from 'tsafe';
import { FrameIterable } from '../animation-description';
import { Frame } from '../frame';

export function combine(...animations: FrameIterable[]): AsyncIterable<Frame> {
  assert(animations.length > 0, 'At least one animation is required');
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const animation of animations) {
        yield* animation;
      }
    },
  };
}
