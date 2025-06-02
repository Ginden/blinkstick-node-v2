import { assert } from 'tsafe';
import { FrameIterable } from '../animation-description';
import { Frame } from '../frame/frame';

export function combineSync<T extends Frame>(...animations: Iterable<T>[]): Iterable<T> {
  assert(animations.length > 0, 'At least one animation is required');
  return {
    [Symbol.iterator]: function* () {
      for (const animation of animations) {
        yield* animation;
      }
    },
  };
}

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
