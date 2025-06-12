import { MinimalDevice } from './create-blinkstick-async';
import { HID } from 'node-hid';
import { BlinkstickSync } from '../core/blinkstick.sync';

/**
 * Creates a BlinkStick object from a USB device.
 * @param device
 * @category Discovery
 */
export function createBlinkstickSync(device: MinimalDevice) {
  const hidDevice = device.path ? new HID(device.path) : new HID(device.vendorId, device.productId);
  return new BlinkstickSync(hidDevice);
}
