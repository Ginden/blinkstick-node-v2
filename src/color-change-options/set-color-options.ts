import { Channel } from '../types';

/**
 * Use LED API instead.
 * @deprecated
 */
export type SetColorOptions = {
  channel?: Channel;
  index?: number;
};
