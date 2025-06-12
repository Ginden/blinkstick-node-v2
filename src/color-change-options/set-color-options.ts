import { Channel } from '../types';

/**
 * Use LED API instead.
 * @deprecated
 * @category Legacy
 */
export type SetColorOptions = {
  channel?: Channel;
  index?: number;
};
