import { Channel } from '../types';

/**
 * Use LED API instead.
 * @deprecated
 * @category Legacy
 */
export type SetColorOptions = {
  channel?: Channel;
  /**
   * Index of the LED to set the color for.
   */
  index?: number;
};
