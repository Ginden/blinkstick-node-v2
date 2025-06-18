import { scheduler } from 'node:timers/promises';

/**
 * Retries a function n times with an increasing delay.
 * Delays are 0, 10, 40, 90, 160, ... ms by default
 */
export async function retryNTimes<V>(
  maxRetries: number,
  fn: () => Promise<V>,
  errorData?: Record<string, unknown>,
  wait: (n: number) => Promise<void> = (n: number) =>
    n === 0 ? scheduler.yield() : scheduler.wait(10 * n ** 2),
): Promise<V> {
  // const wait = (ms: number) => (ms === 0 ? scheduler.yield() : scheduler.wait(ms));
  if (maxRetries === 1) {
    return await fn();
  }
  let error: Error | null = null;
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      return await fn();
    } catch (ex) {
      error ??= ex as Error;
      await wait(retries);
    }
  }
  const syntheticError = new Error(`Failed after ${maxRetries} retries`);
  Error.captureStackTrace(syntheticError, retryNTimes);
  throw Object.assign(error!, {
    syntheticStack: syntheticError.stack,
    ...errorData,
  });
}
