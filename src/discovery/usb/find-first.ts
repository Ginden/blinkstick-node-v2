import { DiscoveryFilter } from '../discovery-filter';
import { BlinkStickLibUsb } from '../../core/blinkstick-lib-usb';
import { findRawDevices } from './find-raw-devices';
import { LibUsbTransport } from '../../transport/lib-usb-transport';
import { deviceDescriptions } from '../../consts/device-descriptions';
import { createBlinkstickLibUsb } from './create-blinkstick-libusb';

export async function findFirst(filter: DiscoveryFilter = () => true): Promise<BlinkStickLibUsb> {
  const actualFilter = typeof filter === 'string' ? deviceDescriptions[filter].test : filter;
  const rawDevices = findRawDevices();
  for (const rawDevice of rawDevices) {
    const blinkStick = await LibUsbTransport.calculateMinimalDeviceInfo(rawDevice);
    if (actualFilter(blinkStick)) {
      return createBlinkstickLibUsb(rawDevice);
    }
  }
  throw new Error('No BlinkStick found');
}
