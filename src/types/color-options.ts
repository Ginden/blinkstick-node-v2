import { COLOR_KEYWORDS } from '../color-keywords';
import { Channel } from './channel';

export type AllPossibleColorOptions = {
  channel?: Channel;
  index?: number;
  repeats?: number;
  delay?: number;
  signal?: AbortSignal;
  duration?: number;
  steps?: number;
};

export type ColorOptions<AdditionalOptions = AllPossibleColorOptions> =
  | [red: number, green: number, blue: number, additionalOptions?: AdditionalOptions]
  | [knownColor: keyof typeof COLOR_KEYWORDS, additionalOptions?: AdditionalOptions]
  | [randomColor: 'random', additionalOptions?: AdditionalOptions]
  | [
      // We declare only first digit, because TS type instantiation becomes too deep otherwise
      css: `#${string}`,
      additionalOptions?: AdditionalOptions,
    ]
  | [{ r: number; g: number; b: number }, additionalOptions?: AdditionalOptions]
  | [css: string, additionalOptions?: AdditionalOptions];

export type NormalizedColorOptions<AdditionalOptions = AllPossibleColorOptions> = {
  red: number;
  green: number;
  blue: number;
  options: AdditionalOptions;
};
