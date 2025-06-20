import { BlinkStickLibUsb } from '../../core/blinkstick-lib-usb';
import { createDiscoverFilterFn, DiscoveryFilter } from '../discovery-filter';
import { getLibUsb } from './get-lib-usb';
import { LibUsbTransport } from '../../transport/lib-usb-transport';
import { createBlinkstickLibUsb } from './create-blinkstick-libusb';

/**
 * Finds all BlinkStick devices using libusb.
 * @category Discovery
 */
export async function findAll(filter: DiscoveryFilter = () => true): Promise<BlinkStickLibUsb[]> {
  const actualFilter = createDiscoverFilterFn(filter);
  const libUsb = getLibUsb();
  const devices = libUsb.getDeviceList();

  const devicesRaw = await Promise.all(
    devices.map(async (device) => {
      const deviceInfo = await LibUsbTransport.calculateMinimalDeviceInfo(device);
      if (!actualFilter(deviceInfo)) {
        return null;
      }

      return createBlinkstickLibUsb(device);
    }),
  );

  return devicesRaw.filter((device): device is BlinkStickLibUsb => device !== null);
}
