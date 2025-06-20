import usb, { HID } from 'node-hid';
import { findRawDevicesSync, findRawDevicesAsync } from './find-raw-devices';
import { createBlinkstickAsync } from './create-blinkstick-async';
import { BlinkstickSync } from '../../core/blinkstick.sync';
import { BlinkstickAsync } from '../../core';

/**
 * Find BlinkSticks using a filter, using synchronous USB device enumeration.
 * @category Discovery
 */
export function findBlinkSticks(filter?: (device: usb.Device) => boolean): BlinkstickSync[] {
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
): Promise<BlinkstickAsync[]> {
  if (!filter) {
    filter = () => true;
  }

  const devices = await findRawDevicesAsync();

  return Promise.all(devices.filter(filter).map(createBlinkstickAsync));
}
