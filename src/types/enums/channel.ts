/**
 * Channel for BlinkStick Pro devices.
 * @category Constants
 */
export const Channel = {
  R: 0,
  G: 1,
  B: 2,
} as const;

/**
 * @category Constants
 */
export type Channel = (typeof Channel)[keyof typeof Channel];
