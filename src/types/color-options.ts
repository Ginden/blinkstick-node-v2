import { COLOR_KEYWORDS } from '../color-keywords';
import { Channel } from './channel';
import { RgbTuple } from './rgb-tuple';

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
  | [ColorObject, additionalOptions?: AdditionalOptions]
  | [css: string, additionalOptions?: AdditionalOptions];

export type SaneColorParam = RgbTuple | ColorObject | keyof typeof COLOR_KEYWORDS;

export type ColorObject = {
  r: number;
  g: number;
  b: number;
};

export interface NormalizedColorOptions<AdditionalOptions = AllPossibleColorOptions>
  extends ColorObject {
  options: AdditionalOptions;
}
