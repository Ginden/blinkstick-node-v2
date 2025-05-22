import { BlinkStick } from '../../core/blinkstick';

/**
 * Get an infoblock from a device.
 *
 * @deprecated
 * @param {BlinkStick} device Device from which to get the value.
 * @param {Number} location Address to seek the data.
 */
export async function getInfoBlock(device: BlinkStick, location: number) {
  const buffer = await device.getFeatureReport(location, 33);

  let result = '';

  for (let i = 1, l = buffer.length; i < l; i++) {
    // TODO: this one seems really odd
    if (i === 0) break;
    result += String.fromCharCode(buffer[i]);
  }

  return result;
}

export async function getInfoBlockRaw(device: BlinkStick, location: number) {
  const buffer = await device.getFeatureReport(location, 33);
  return Buffer.from(buffer, 1);
}
