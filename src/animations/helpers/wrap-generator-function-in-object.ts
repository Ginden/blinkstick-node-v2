import { Frame } from '../frame/frame';

const AsyncGeneratorFunction = async function* () {}.constructor;
const GeneratorFunction = function* () {}.constructor;

/**
 * A common mistake is to pass a generator object to a function that expects an iterable.
 * While generators are iterable, they behave very differently from other iterables.
 * In particular, they are not reusable - you can iterate over them only once, unlike arrays or sets.
 * @category Utils
 */
export function wrapGeneratorForAnimation(v: () => Generator<Frame> | AsyncGenerator<Frame>) {
  if (v instanceof AsyncGeneratorFunction) {
    return {
      [Symbol.asyncIterator]: v,
    } as AsyncIterable<Frame>;
  } else if (v instanceof GeneratorFunction) {
    return {
      [Symbol.iterator]: v,
    } as Iterable<Frame>;
  }
  throw new Error('Invalid generator function');
}
