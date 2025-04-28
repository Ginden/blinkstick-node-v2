import type { HID, HIDAsync } from 'node-hid';
import { BlinkStick } from '../../blinkstick';

/**
 * Sets an infoblock on a device.
 * @param {BlinkStick} device Device on which to set the value.
 * @param {Number} location Address to seek the data.
 * @param {String | Buffer} data The value to push to the device. Should be <= 32 chars.
 */
export async function setInfoBlock(
  device: BlinkStick<HIDAsync | HID>,
  location: number,
  data: string | Buffer,
) {
  const l = Math.min(data.length, 33);
  const buffer = Buffer.alloc(33, 0);

  if (data instanceof Uint8Array) {
    if (data.length !== 33) {
      throw new Error('Data length is not 33 bytes');
    }
    return await device.setFeatureReport(location, Buffer.alloc(33, data));
  }

  buffer[0] = 0;
  for (let i = 0; i < l; i++) buffer[i + 1] = data.charCodeAt(i);

  return await device.setFeatureReport(location, buffer);
}
