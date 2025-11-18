import { createBlinkstickAsync } from '../create/create-blinkstick-async';
import { findBlinkSticks } from './find-blink-sticks';
import { findRawDevicesAsync } from './find-raw-devices';
import { type BlinkstickSync } from '../../../core';
import { createDiscoverFilterFn, DiscoveryFilter } from '../../discovery-filter';

/**
 * Find first attached BlinkStick and create a BlinkStick object.
 * Optionally takes a product name to filter by.
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
 * Find first attached BlinkStick asynchronously and create a BlinkStick object.
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
 * Finds a blinkstick by its ID.
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
