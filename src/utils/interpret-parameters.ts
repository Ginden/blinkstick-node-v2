import { ColorOptions, NormalizedColorOptions } from '../types/color-options';
import { randomIntInclusive } from './random-int-inclusive';
import { clampRgb } from './clamp';
import { typeGuard } from 'tsafe';
import { COLOR_KEYWORDS } from '../color-keywords';
import { normalizeHexColor } from './normalize-hex-color';

export function interpretParameters<AdditionalOptions>(
  this: void,
  ...args: ColorOptions<AdditionalOptions>
): NormalizedColorOptions {
  if (args[0] === 'random') {
    return {
      red: randomIntInclusive(0, 255),
      green: randomIntInclusive(0, 255),
      blue: randomIntInclusive(0, 255),
      options: args[1] ?? {},
    };
  }
  if (typeof args[0] === 'number') {
    return {
      red: clampRgb(args[0]),
      green: clampRgb(args[1]),
      blue: clampRgb(args[2]),
      options: args[3] ?? {},
    };
  }
  if (typeof args[0] === 'object') {
    if (args[0] === null) {
      throw new TypeError('Invalid color format. Expected a hex string or a color keyword.');
    }
    const { r, g, b } = args[0];
    return interpretParameters(r, g, b, args[1]);
  }

  if (typeGuard<keyof typeof COLOR_KEYWORDS>(args[0], args[0] in COLOR_KEYWORDS)) {
    return interpretParameters(COLOR_KEYWORDS[args[0]], args[1]);
  }

  if (typeGuard<`rgb(${string}`>(args[0], args[0].startsWith('rgb'))) {
    const rgb = args[0].trim().match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!rgb) {
      throw new TypeError('Invalid color format. Expected a hex string or a color keyword.');
    }
    return interpretParameters(parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]), args[1]);
  }

  return normalizeHexColor(args[0], args[1] ?? {});
}
