import { AnimationDescription } from '../../animation-description';
import { Frame } from '../../frame';

export function combine(...animations: AnimationDescription[]): AsyncIterable<Frame> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const animation of animations) {
        yield* animation;
      }
    },
  };
}
