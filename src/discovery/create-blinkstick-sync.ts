import { MinimalDevice } from './create-blinkstick-async';
import { HID } from 'node-hid';
import { BlinkstickSync } from '../core/blinkstick.sync';

export function createBlinkstickSync(device: MinimalDevice) {
  const hidDevice = device.path ? new HID(device.path) : new HID(device.vendorId, device.productId);
  return new BlinkstickSync(hidDevice);
}
