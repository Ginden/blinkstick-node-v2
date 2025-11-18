import { HIDAsync, type Device } from 'node-hid';
import { blinkstickFinalizationRegistry } from '../../../core/blinkstick-finalization-registry';
import { BlinkstickAsync } from '../../../core/versions/blinkstick.async';

export type MinimalDevice = Pick<
  Device,
  'vendorId' | 'productId' | 'path' | 'serialNumber' | 'manufacturer' | 'product'
>;

/**
 * @summary This function creates a BlinkstickAsync instance from a USB device.
 * @remarks It also registers the BlinkStick object in a FinalizationRegistry to increase the chance that the device will be closed
 * when the object is garbage collected.
 *
 * This function is unlikely to be needed by end users, but you are an adult.
 *
 * @param device
 * @category Discovery
 */
export async function createBlinkstickAsync(device: MinimalDevice): Promise<BlinkstickAsync> {
  const hidDevice = device.path
    ? await HIDAsync.open(device.path)
    : await HIDAsync.open(device.vendorId, device.productId);
  const blinkstick = new BlinkstickAsync(hidDevice, await hidDevice.getDeviceInfo());
  const hidTransport = blinkstick.getTransport();

  blinkstickFinalizationRegistry.register(blinkstick, hidTransport, blinkstick);

  return blinkstick;
}
