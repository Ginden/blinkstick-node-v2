import usb, { HID } from 'node-hid';
import { findRawDevicesSync, findRawDevicesAsync } from './find-raw-devices';
import { createBlinkstickAsync } from '../create/create-blinkstick-async';
import { BlinkstickSync } from '../../../core/versions/blinkstick.sync';
import { BlinkstickAsync } from '../../../core';

/**
 * @summary A filter function for Node-HID devices.
 */
export type NodeHidFilterFunction = (device: usb.Device) => boolean;

/**
 * @summary Find BlinkSticks using a filter, using synchronous USB device enumeration.
 * @category Discovery
 */
export function findBlinkSticksSync(filter: NodeHidFilterFunction = () => true): BlinkstickSync[] {
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
 * @deprecated Use proper named export findBlinkSticksSync instead.
 */
export { findBlinkSticksSync as findBlinkSticks };

/**
 * @summary Find BlinkSticks using a filter, using asynchronous USB device enumeration.
 * @param filter
 * @category Discovery
 */
export async function findBlinkSticksAsync(
  filter: NodeHidFilterFunction = () => true,
): Promise<BlinkstickAsync[]> {
  const devices = await findRawDevicesAsync();

  return Promise.all(devices.filter(filter).map(createBlinkstickAsync));
}
