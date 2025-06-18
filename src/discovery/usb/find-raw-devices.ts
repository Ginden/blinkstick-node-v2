import { getLibUsb } from './get-lib-usb';
import { PRODUCT_ID, VENDOR_ID } from '../../consts/consts';

export function findRawDevices() {
  const libUsb = getLibUsb();
  return libUsb.getDeviceList().filter((d) => {
    return d.deviceDescriptor.idVendor === VENDOR_ID && d.deviceDescriptor.idProduct === PRODUCT_ID;
  });
}
