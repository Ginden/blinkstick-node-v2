import { BlinkStickLibUsb } from '../../core/blinkstick-lib-usb';
import { LibUsbTransport } from '../../transport/lib-usb-transport';
import { blinkstickFinalizationRegistry } from '../../core/blinkstick-finalization-registry';
import type { Device } from 'usb';

/**
 * Creates a BlinkStickLibUsb instance from a USB device.
 * @category Discovery
 */
export async function createBlinkstickLibUsb(device: Device): Promise<BlinkStickLibUsb> {
  device.open();
  const blinkstick = new BlinkStickLibUsb(await LibUsbTransport.buildFromDevice(device));
  const hidTransport = blinkstick.getTransport();

  blinkstickFinalizationRegistry.register(blinkstick, hidTransport, blinkstick);

  return blinkstick;
}
