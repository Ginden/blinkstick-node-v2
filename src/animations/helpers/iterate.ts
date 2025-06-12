/**
 * Collects all items from an iterable or async iterable into an array.
 * @category Animation
 */
export async function asyncCollect<V>(iterable: Iterable<V> | AsyncIterable<V>): Promise<V[]> {
  const ret: V[] = [];
  for await (const item of iterable) {
    ret.push(item);
  }
  return ret;
}
