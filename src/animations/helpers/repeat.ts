import { AnimationDescription } from '../animation-description';
import { Frame } from '../frame';
import AsyncIterator = NodeJS.AsyncIterator;
import { iterate } from './iterate';
import { assert } from 'tsafe';
import { types } from 'node:util';

/**
 * Note that passing a generator object to repeat will not work as expected;
 * @param animation
 * @param times
 */
export function repeat(
  animation: AnimationDescription | (() => AnimationDescription),
  times: number,
): AnimationDescription {
  if (times === 1) {
    return animation;
  }
  assert(times > 0, 'Times must be greater than 0');
  assert(
    !types.isGeneratorObject(animation),
    'Passing a generator object to repeat will not work as expected - wrap the call in a function',
  );
  if (times === Infinity) {
    return {
      [Symbol.asyncIterator]: async function* (): AsyncIterator<Frame> {
        while (true) {
          yield* iterate(animation);
        }
      },
    };
  }
  return {
    [Symbol.asyncIterator]: async function* () {
      for (let i = 0; i < times; i++) {
        yield* typeof animation === 'function' ? animation() : animation;
      }
    },
  };
}
