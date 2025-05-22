const AsyncGeneratorFunction = async function* () {}.constructor;
const GeneratorFunction = function* () {}.constructor;

/**
 * A common mistake is to pass a generator object to a function that expects an async generator.
 * @param v
 */
export function wrapGeneratorForAnimation(v: GeneratorFunction) {
  if (v instanceof AsyncGeneratorFunction) {
    return {
      [Symbol.asyncIterator]: v,
    };
  } else if (v instanceof GeneratorFunction) {
    return {
      [Symbol.iterator]: v,
    };
  }
  throw new Error('Invalid generator function');
}
