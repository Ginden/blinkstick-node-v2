import { createBlinkstickAsync } from '../create/create-blinkstick-async';
import { findBlinkSticks } from './find-blink-sticks';
import { findRawDevicesAsync } from './find-raw-devices';
import { type BlinkstickSync } from '../../../core';
import { createDiscoverFilterFn, DiscoveryFilter } from '../../discovery-filter';

/**
 * @summary Find first attached BlinkStick and create a BlinkStickSync object.
 * @remarks Optionally takes a filter (device name or function) to find a specific BlinkStick.
 * Returns null if no BlinkStick is found.
 * @category Discovery
 */
export function findFirstSync(
  discoveryFilter: DiscoveryFilter = () => true,
): BlinkstickSync | null {
  const actualFilter = createDiscoverFilterFn(discoveryFilter);
  return findBlinkSticks(actualFilter)[0] ?? null;
}

/**
 * @deprecated Use proper named export findFirstSync instead.
 */
export { findFirstSync as findFirst };

/**
 * @summary Find first attached BlinkStick asynchronously and create a BlinkStickAsync instance.
 * @category Discovery
 */
export async function findFirstAsync(discoveryFilter: DiscoveryFilter = () => true) {
  const devices = await findRawDevicesAsync();
  const actualFilter = createDiscoverFilterFn(discoveryFilter);
  for (const device of devices) {
    if (actualFilter(device)) {
      return await createBlinkstickAsync(device);
    }
  }
  return null;
}

/**
 * @summary Finds a blinkstick by its ID.
 * @param id The ID of the blinkstick to find, created via `blinkstick.id`.
 * @returns The found blinkstick or null if not found.
 * @category Discovery
 */
export async function findByIdAsync(id: string) {
  const devices = await findRawDevicesAsync();

  for (const device of devices) {
    const blinkstick = await createBlinkstickAsync(device);
    const deviceId = await blinkstick.id.getId();
    if (deviceId === id) {
      return blinkstick;
    } else {
      // Close the device if it's not the one we're looking for
      await blinkstick.close();
    }
  }

  return null;
}
