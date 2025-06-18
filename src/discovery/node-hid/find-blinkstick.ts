import { findFirst, findFirstAsync } from './find-first';
import { findBlinkSticks, findBlinkSticksAsync } from './find-blink-sticks';

/**
 * Find BlinkStick devices.
 * @namespace findBlinkstick
 * @category Discovery
 */
export const findBlinkstick = {
  firstSync: findFirst,
  first: findFirstAsync,
  allSync: findBlinkSticks,
  all: findBlinkSticksAsync,
};
