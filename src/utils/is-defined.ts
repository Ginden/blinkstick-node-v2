export function isDefined<V>(value: V | undefined | null): value is NonNullable<V> {
  return value != null;
}
