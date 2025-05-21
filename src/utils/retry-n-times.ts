import { scheduler } from 'node:timers/promises';

/**
 * Retries a function n times with an increasing delay.
 * Delays are 0, 1, 4, 9, 16, ... ms.
 * @param maxRetries
 * @param fn
 */
export async function retryNTimes<V>(maxRetries: number, fn: () => Promise<V>): Promise<V> {
  const wait = (ms: number)=> ms === 0 ? scheduler.yield() : scheduler.wait(ms);
  if (maxRetries === 1) {
    return await fn();
  }
  let error: Error | null = null;
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      return await fn();
    } catch (ex) {
      error ??= ex as Error;
      await wait(retries**2);
    }
  }
  throw Object.assign(error!, {
    syntheticStack: Error(`Synthetic place`).stack,
  });
}
