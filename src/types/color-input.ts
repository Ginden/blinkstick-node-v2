import { RgbTuple } from './rgb-tuple';
import { COLOR_KEYWORDS } from '../consts/color-keywords';

import { ColorObject } from './color-object';

/**
 * Type representing a color input that can be a tuple of RGB values, an object with RGB properties, or a color keyword.
 *
 * This type is base type for color inputs in non-legacy APIs.
 *
 * @category Inputs
 */
export type ColorInput = RgbTuple | ColorObject | keyof typeof COLOR_KEYWORDS;
