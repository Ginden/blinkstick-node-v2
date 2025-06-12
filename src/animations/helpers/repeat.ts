import { FrameIterable } from '../animation-description';
import { assert } from 'tsafe';
import { types } from 'node:util';

/**
 * Repeats an animation a specified number of times.
 * Note that passing a generator object to repeat will not work as expected;
 * @category Animation
 */
export function repeat(
  animation: FrameIterable | (() => FrameIterable),
  times: number,
): FrameIterable {
  if (times === 1) {
    return typeof animation === 'function' ? animation() : animation;
  }
  assert(times > 0, 'Times must be greater than 0');
  assert(
    !types.isGeneratorObject(animation),
    'Passing a generator object to repeat will not work as expected - wrap the call in a function',
  );
  if (times === Infinity) {
    return {
      [Symbol.asyncIterator]: async function* () {
        while (true) {
          yield* typeof animation === 'function' ? animation() : animation;
        }
      },
    } as FrameIterable;
  }
  return {
    [Symbol.asyncIterator]: async function* () {
      for (let i = 0; i < times; i++) {
        yield* typeof animation === 'function' ? animation() : animation;
      }
    },
  };
}
