import { KnownDeviceName } from '../consts/device-descriptions';
import { MinimalDeviceInfo } from '../transport';

export type DiscoveryFilter = KnownDeviceName | ((device: MinimalDeviceInfo) => boolean);
