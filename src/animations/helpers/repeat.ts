import { AnimationDescription } from '../animation-description';
import { Frame } from '../frame';
import AsyncIterator = NodeJS.AsyncIterator;

export function repeat(animation: AnimationDescription, times: number): AnimationDescription {
  if (times === 1) {
    return animation;
  }
  if (times <= 0) {
    throw new Error('Times must be greater than 0');
  }
  if (times === Infinity) {
    return {
      [Symbol.asyncIterator]: async function* (): AsyncIterator<Frame> {
        while (true) {
          yield* animation;
        }
      },
    };
  }
  return {
    [Symbol.asyncIterator]: async function* () {
      for (let i = 0; i < times; i++) {
        yield* animation;
      }
    },
  };
}
