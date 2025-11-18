import { MinimalDevice } from './create-blinkstick-async';
import { HID } from 'node-hid';
import { BlinkstickSync } from '../../../core/versions/blinkstick.sync';

/**
 * @summary Creates a BlinkStickSync instance from a USB device.
 * @category Discovery
 */
export function createBlinkstickSync(device: MinimalDevice) {
  const hidDevice = device.path ? new HID(device.path) : new HID(device.vendorId, device.productId);
  return new BlinkstickSync(hidDevice);
}
