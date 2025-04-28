import { createBlinkstickAsync } from './create-blinkstick-async';
import { findBlinkSticks } from './find-blink-sticks';
import { findRawDevicesAsync } from './find-raw-devices';

/**
 * Find first attached BlinkStick.
 */
export function findFirst() {
  return findBlinkSticks(() => true)[0] ?? null;
}

export async function findFirstAsync() {
  const devices = await findRawDevicesAsync();
  const firstDevice = devices[0];
  if (!firstDevice) {
    return null;
  }
  return await createBlinkstickAsync(firstDevice);
}
