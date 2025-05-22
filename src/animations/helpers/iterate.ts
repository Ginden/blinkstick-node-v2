export function iterate<V>(
  iterable: AsyncIterable<V> | Iterable<V>,
): typeof iterable extends AsyncIterable<V> ? AsyncIterable<V> : Iterable<V> {
  if (Symbol.asyncIterator in iterable) {
    return iterable[Symbol.asyncIterator]();
  }
  return iterable[Symbol.iterator]();
}

export async function asyncCollect<V>(iterable: Iterable<V> | AsyncIterable<V>): Promise<V[]> {
  const ret: V[] = [];
  for await (const item of iterable) {
    ret.push(item);
  }
  return ret;
}
