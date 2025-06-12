import { createBlinkstickAsync } from './create-blinkstick-async';
import { findBlinkSticks } from './find-blink-sticks';
import { findRawDevicesAsync } from './find-raw-devices';
import { deviceDescriptions } from '../consts/device-descriptions';

/**
 * Find first attached BlinkStick and create a BlinkStick object.
 * Optionally takes a product name to filter by.
 * @category Discovery
 */
export function findFirst(productName?: keyof typeof deviceDescriptions) {
  if (productName) {
    const device = findBlinkSticks((device) => deviceDescriptions[productName].test(device))[0];
    return device ?? null;
  }
  return findBlinkSticks(() => true)[0] ?? null;
}

/**
 * Find first attached BlinkStick asynchronously and create a BlinkStick object.
 * @category Discovery
 */
export async function findFirstAsync(productName?: keyof typeof deviceDescriptions) {
  const devices = await findRawDevicesAsync();
  if (productName) {
    const device = devices.find((device) => deviceDescriptions[productName].test(device));
    if (device) {
      return await createBlinkstickAsync(device);
    } else {
      return null;
    }
  }
  const firstDevice = devices[0];
  if (!firstDevice) {
    return null;
  }
  return await createBlinkstickAsync(firstDevice);
}
