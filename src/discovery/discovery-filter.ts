import { deviceDescriptions, KnownDeviceName } from '../consts/device-descriptions';
import { MinimalDeviceInfo } from '../transport';

export type DiscoverFilterFunction = (device: MinimalDeviceInfo) => boolean;

export type DiscoveryFilter = KnownDeviceName | DiscoverFilterFunction;

export function createDiscoverFilterFn(filter: DiscoveryFilter | null): DiscoverFilterFunction {
  if (typeof filter === 'function') {
    return filter;
  }
  if (filter === null) {
    return () => true; // No filter, accept all devices
  }
  return (device: MinimalDeviceInfo) => deviceDescriptions[filter].test(device);
}
