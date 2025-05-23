import { findFirst, findFirstAsync } from './find-first';
import { findBlinkSticks, findBlinkSticksAsync } from './find-blink-sticks';

export const findBlinkstick = {
  firstSync: findFirst,
  first: findFirstAsync,
  allSync: findBlinkSticks,
  all: findBlinkSticksAsync,
};
