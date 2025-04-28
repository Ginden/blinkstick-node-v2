export async function retryNTimes<V>(maxRetries: number, fn: () => Promise<V>): Promise<V> {
  let error: Error | null = null;
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      return await fn();
    } catch (ex) {
      error ??= ex as Error;
    }
  }
  throw error ?? new Error('Failed to perform an operation after maximum retries');
}
