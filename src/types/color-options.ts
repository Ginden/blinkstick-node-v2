import { COLOR_KEYWORDS } from '../consts/color-keywords';
import { AllPossibleColorOptions } from './all-possible-color-options';
import { ColorObject } from './color-object';

/**
 * @deprecated Use newer APIs instead
 */
export type ColorOptions<AdditionalOptions = AllPossibleColorOptions> =
  | [red: number, green: number, blue: number, additionalOptions?: AdditionalOptions]
  | [knownColor: keyof typeof COLOR_KEYWORDS, additionalOptions?: AdditionalOptions]
  | [randomColor: 'random', additionalOptions?: AdditionalOptions]
  | [
      // We declare only the first digit, because TS type instantiation becomes too deep otherwise
      css: `#${string}`,
      additionalOptions?: AdditionalOptions,
    ]
  | [ColorObject, additionalOptions?: AdditionalOptions]
  | [css: string, additionalOptions?: AdditionalOptions];

export interface NormalizedColorOptions<AdditionalOptions = AllPossibleColorOptions>
  extends ColorObject {
  options: AdditionalOptions;
}
