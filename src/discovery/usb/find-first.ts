import { createDiscoverFilterFn, DiscoveryFilter } from '../discovery-filter';
import { BlinkStickLibUsb } from '../../core/blinkstick-lib-usb';
import { findRawDevices } from './find-raw-devices';
import { LibUsbTransport } from '../../transport/lib-usb-transport';
import { createBlinkstickLibUsb } from './create-blinkstick-libusb';

/**
 * Find first attached BlinkStick using libusb and create a BlinkStick object.
 * @category Discovery
 */
export async function findFirst(filter: DiscoveryFilter = () => true): Promise<BlinkStickLibUsb> {
  const actualFilter = createDiscoverFilterFn(filter);
  const rawDevices = findRawDevices();
  for (const rawDevice of rawDevices) {
    const blinkStick = await LibUsbTransport.calculateMinimalDeviceInfo(rawDevice);
    if (actualFilter(blinkStick)) {
      return createBlinkstickLibUsb(rawDevice);
    }
  }
  throw new Error('No BlinkStick found');
}
