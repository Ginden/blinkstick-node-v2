import { findFirst, findFirstAsync } from './find-first';
import { findBlinkSticks, findBlinkSticksAsync } from './find-blink-sticks';

export const findBlinkstick = {
  findFirstSync: findFirst,
  findFirstAsync: findFirstAsync,
  findAllSync: findBlinkSticks,
  findAllAsync: findBlinkSticksAsync,
};
