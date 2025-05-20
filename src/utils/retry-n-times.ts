import { scheduler } from 'node:timers/promises';

export async function retryNTimes<V>(maxRetries: number, fn: () => Promise<V>): Promise<V> {
  if (maxRetries === 1) {
    return await fn();
  }
  let error: Error | null = null;
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      return await fn();
    } catch (ex) {
      error ??= ex as Error;
      await scheduler.yield();
    }
  }
  throw Object.assign(error!, {
    syntheticStack: Error(`Synthetic place`).stack,
  });
}
