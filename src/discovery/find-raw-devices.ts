import usb from 'node-hid';
import { PRODUCT_ID, VENDOR_ID } from '../consts/consts';

/**
 * Find raw USB devices using synchronous USB device enumeration.
 */
export function findRawDevicesSync(): usb.Device[] {
  return usb.devices(VENDOR_ID, PRODUCT_ID);
}

/**
 * Find raw USB devices using asynchronous USB device enumeration.
 */
export async function findRawDevicesAsync() {
  return await usb.devicesAsync(VENDOR_ID, PRODUCT_ID);
}
