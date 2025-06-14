import usb, { HID, HIDAsync } from 'node-hid';
import { findRawDevicesSync, findRawDevicesAsync } from './find-raw-devices';
import { BlinkStick } from '../core/blinkstick';
import { createBlinkstickAsync } from './create-blinkstick-async';
import { BlinkstickSync } from '../core/blinkstick.sync';

/**
 * Find BlinkSticks using a filter, using synchronous USB device enumeration.
 * @param filter
 * @category Discovery
 */
export function findBlinkSticks(filter?: (device: usb.Device) => boolean): BlinkStick<HID>[] {
  if (!filter) {
    filter = () => true;
  }

  return findRawDevicesSync()
    .filter(filter)
    .map((device) => {
      const hidDevice = device.path
        ? new HID(device.path)
        : new HID(device.vendorId, device.productId);
      return new BlinkstickSync(hidDevice);
    });
}

/**
 * Find BlinkSticks using a filter, using asynchronous USB device enumeration.
 * @param filter
 * @category Discovery
 */
export async function findBlinkSticksAsync(
  filter?: (device: usb.Device) => boolean,
): Promise<BlinkStick<HIDAsync>[]> {
  if (!filter) {
    filter = () => true;
  }

  const devices = await findRawDevicesAsync();

  return Promise.all(devices.filter(filter).map(createBlinkstickAsync));
}
