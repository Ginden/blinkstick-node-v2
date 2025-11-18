/**
 * @summary Channel for BlinkStick Pro devices.
 * @category Constants
 * @enum
 */
export const Channel = {
  R: 0,
  G: 1,
  B: 2,
} as const;

/**
 * @category Constants
 * @internal
 */
export type Channel = (typeof Channel)[keyof typeof Channel];
