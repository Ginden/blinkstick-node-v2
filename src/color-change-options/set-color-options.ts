import { Channel } from '../types';

/**
 * @summary Legacy options for setting color on LEDs.
 * @deprecated Use LED API instead.
 * @category Legacy
 */
export type SetColorOptions = {
  channel?: Channel;
  /**
   * Index of the LED to set the color for.
   */
  index?: number;
};
