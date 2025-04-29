import { HIDAsync, type Device } from 'node-hid';
import { BlinkStick } from '../blinkstick';
import { blinkstickFinalizationRegistry } from '../blinkstick-finalization-registry';

export type MinimalDevice = Pick<
  Device,
  'vendorId' | 'productId' | 'path' | 'serialNumber' | 'manufacturer' | 'product'
>;

/**
 * This function creates a BlinkStick object from a USB device.
 * It also registers the BlinkStick object in a FinalizationRegistry to increase chance that the device will be closed
 * when the object is garbage collected.
 *
 * This function is unlikely to be needed by end users, but you are an adult.
 *
 * @param device
 */
export async function createBlinkstickAsync(device: MinimalDevice): Promise<BlinkStick<HIDAsync>> {
  const hidDevice = device.path
    ? await HIDAsync.open(device.path)
    : await HIDAsync.open(device.vendorId, device.productId);
  const blinkstick = new BlinkStick<HIDAsync>(
    hidDevice,
    device.serialNumber!,
    device.manufacturer!,
    device.product!,
  );

  blinkstickFinalizationRegistry.register(blinkstick, hidDevice, blinkstick);

  return blinkstick;
}
