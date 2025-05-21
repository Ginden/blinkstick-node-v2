import usb from 'node-hid';
import { PRODUCT_ID, VENDOR_ID } from '../consts/consts';

export function findRawDevices(): usb.Device[] {
  return usb.devices(VENDOR_ID, PRODUCT_ID);
}

export async function findRawDevicesAsync() {
  return await usb.devicesAsync(VENDOR_ID, PRODUCT_ID);
}
