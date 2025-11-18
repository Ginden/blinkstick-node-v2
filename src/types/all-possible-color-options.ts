import { Channel } from './enums/channel';

/**
 * @deprecated Use newer APIs instead
 * @category Legacy
 * @category Inputs
 */
export type AllPossibleColorOptions = {
  channel?: Channel;
  index?: number;
  repeats?: number;
  delay?: number;
  signal?: AbortSignal;
  duration?: number;
  steps?: number;
};
