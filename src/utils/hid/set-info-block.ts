import type { BlinkstickAny } from '../../core/blinkstick';
import { asBuffer } from '../as-buffer';
import { assert } from 'tsafe';

/**
 * Sets an infoblock on a device.
 * @param {BlinkStick} device Device on which to set the value.
 * @param {Number} location Address to seek the data.
 * @param {Buffer} data The value to push to the device. Should be <= 32 bytes
 */
export async function setInfoBlock(
  device: Pick<BlinkstickAny, 'setFeatureReport'>,
  location: number,
  data: Buffer,
) {
  if (data.length !== 33) {
    throw new Error('Data length is not 33 bytes');
  }
  const sentBuffer = asBuffer(data);
  assert(sentBuffer[0] === location, 'Data location does not match the expected location');
  return await device.setFeatureReport(sentBuffer);
}
