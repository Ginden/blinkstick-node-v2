import { deviceDescriptions, KnownDeviceName } from '../consts/device-descriptions';
import { MinimalDeviceInfo } from '../transport';

/**
 * @summary A function used to filter devices during discovery.
 * @category Discovery
 */
export type DiscoverFilterFunction = (device: MinimalDeviceInfo) => boolean;

/**
 * @summary A filter used during device discovery to select specific devices.
 * @category Discovery
 */
export type DiscoveryFilter = KnownDeviceName | DiscoverFilterFunction;


/**
 * Creates a discovery filter function from a given filter.
 * @param filter
 * @category Discovery
 */
export function createDiscoverFilterFn(filter: DiscoveryFilter | null): DiscoverFilterFunction {
  if (typeof filter === 'function') {
    return filter;
  }
  if (filter === null) {
    return () => true; // No filter, accept all devices
  }
  return (device: MinimalDeviceInfo) => deviceDescriptions[filter].test(device);
}
