import { ColorOptions, NormalizedColorOptions } from '../../types/color-options';
import { randomIntInclusive } from '../random-int-inclusive';
import { clampRgb } from '../clamp';
import { typeGuard } from 'tsafe';
import { COLOR_KEYWORDS } from '../../consts/color-keywords';
import { normalizeHexColor } from './normalize-hex-color';
import parseCss from 'color-rgba';
import {getRandomColor} from "./get-random-color";

function randomColor<AdditionalOptions>(options: AdditionalOptions) {
  return {
    ...getRandomColor(),
    options: options ?? {},
  };
}

function fromRgb<Options>(r: number, green: number, blue: number, options: Options) {
  return {
    r: clampRgb(r),
    g: clampRgb(green),
    b: clampRgb(blue),
    options: options ?? {},
  };
}

export function interpretParameters<AdditionalOptions>(
  this: void,
  ...args: ColorOptions<AdditionalOptions>
): NormalizedColorOptions {
  if (args[0] === 'random') {
    return randomColor(args[1] as AdditionalOptions);
  }
  if (typeof args[0] === 'number') {
    return fromRgb(args[0], args[1], args[2], args[3]);
  }
  if (typeof args[0] === 'object') {
    if (args[0] === null) {
      throw new TypeError('Invalid color format. Expected a hex string or a color keyword.');
    }
    const { r, g, b } = args[0];
    return fromRgb(r, g, b, args[1]);
  }

  if (typeGuard<keyof typeof COLOR_KEYWORDS>(args[0], args[0] in COLOR_KEYWORDS)) {
    return normalizeHexColor(COLOR_KEYWORDS[args[0]], args[1] ?? {});
  }

  if (typeGuard<`#${string}`>(args[0], args[0].startsWith('#'))) {
    return normalizeHexColor(args[0], args[1] ?? {});
  }

  const parsedColor = parseCss(args[0]);
  if (parsedColor.length !== 4) {
    throw new TypeError('Invalid color format. Expected a hex string or a color keyword.');
  }
  if (parsedColor[3] !== 1) {
    throw new TypeError(
      'Alpha channel is not supported. Please use a color without alpha channel.',
    );
  }
  return fromRgb(parsedColor[0], parsedColor[1], parsedColor[2], args[1] ?? {});
}

export const interpretParametersInversed: typeof interpretParameters = (
  ...args: Parameters<typeof interpretParameters>
) => {
  const ret = interpretParameters(...args);
  return {
    r: 255 - ret.r,
    g: 255 - ret.g,
    b: 255 - ret.b,
    options: ret.options,
  };
};
