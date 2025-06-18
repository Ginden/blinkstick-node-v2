import type { BlinkstickAny } from '../../core/blinkstick';
import { asBuffer } from '../as-buffer';
import { assert } from 'tsafe';

/**
 * Sets an infoblock on a device.
 * @param {BlinkStick} device Device on which to set the value.
 * @param {Number} location Address to seek the data.
 * @param {String | Buffer} data The value to push to the device. Should be <= 32 chars.
 */
export async function setInfoBlock(
  device: Pick<BlinkstickAny, 'setFeatureReport'>,
  location: number,
  data: string | Buffer,
) {
  const l = Math.min(data.length, 33);
  const buffer = Buffer.alloc(33, 0);

  if (data instanceof Uint8Array) {
    if (data.length !== 33) {
      throw new Error('Data length is not 33 bytes');
    }
    const sentBuffer = asBuffer(data);
    assert(sentBuffer[0] === location, 'Data location does not match the expected location');
    return await device.setFeatureReport(Buffer.alloc(33, data));
  }

  buffer[0] = location;
  for (let i = 0; i < l; i++) buffer[i + 1] = data.charCodeAt(i);

  return await device.setFeatureReport(buffer);
}
