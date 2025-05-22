export async function asyncCollect<V>(iterable: Iterable<V> | AsyncIterable<V>): Promise<V[]> {
  const ret: V[] = [];
  for await (const item of iterable) {
    ret.push(item);
  }
  return ret;
}
