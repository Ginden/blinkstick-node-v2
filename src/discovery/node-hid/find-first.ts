import { createBlinkstickAsync } from './create-blinkstick-async';
import { findBlinkSticks } from './find-blink-sticks';
import { findRawDevicesAsync } from './find-raw-devices';
import { BlinkstickSync } from '../../core';
import { createDiscoverFilterFn, DiscoveryFilter } from '../discovery-filter';

/**
 * Find first attached BlinkStick and create a BlinkStick object.
 * Optionally takes a product name to filter by.
 * @category Discovery
 */
export function findFirst(discoveryFilter: DiscoveryFilter = () => true): BlinkstickSync | null {
  const actualFilter = createDiscoverFilterFn(discoveryFilter);
  return findBlinkSticks(actualFilter)[0] ?? null;
}

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
