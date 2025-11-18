import { findByIdAsync, findFirst, findFirstAsync } from './find/find-first';
import { findBlinkSticks, findBlinkSticksAsync } from './find/find-blink-sticks';

export {
  findByIdAsync as byId,
  findFirst as firstSync,
  findFirstAsync as first,
  findBlinkSticks as allSync,
  findBlinkSticksAsync as all,
};
