import { findByIdAsync, findFirst, findFirstAsync } from './find/find-first';
import { findBlinkSticks, findBlinkSticksAsync } from './find/find-blink-sticks';

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
  byId: findByIdAsync,
};
