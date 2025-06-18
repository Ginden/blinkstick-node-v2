/**
 * @deprecated Use Animation API instead.
 * @category Legacy
 */
export type MorphOptions = {
  /*
   * The index of LED to morph
   */
  index?: number;
  duration?: number;
  steps?: number;
  signal?: AbortSignal;
  /**
   * Likely unused by firmware, but included for consistency.
   */
  channel?: number;
};
