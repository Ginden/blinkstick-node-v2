import { BlinkStick } from '../../blinkstick';
import type { HID, HIDAsync } from 'node-hid';

/**
 * Get an infoblock from a device.
 *
 * @private
 * @static
 * @method getInfoBlock
 * @param {BlinkStick} device Device from which to get the value.
 * @param {Number} location Address to seek the data.
 * @param {Function} callback Callback to which to pass the value.
 */
export async function getInfoBlock(device: BlinkStick<HID | HIDAsync>, location: number) {
  const buffer = await device.getFeatureReport(location, 33);

  let result = '';

  for (let i = 1, l = buffer.length; i < l; i++) {
    // TODO: this one seems really odd
    if (i === 0) break;
    result += String.fromCharCode(buffer[i]);
  }

  return result;
}
