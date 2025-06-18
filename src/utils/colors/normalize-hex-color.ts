import { NormalizedColorOptions } from '../../types/color-options';
import { AllPossibleColorOptions } from '../../types/all-possible-color-options';
import { RgbTuple } from '../../types';

export function normalizeHexColor(
  color: string,
  options?: AllPossibleColorOptions,
): NormalizedColorOptions {
  // TODO: this can be cached, I guess, at least for COLOR_KEYWORDS
  if (color.startsWith('#')) {
    return normalizeHexColor(color.slice(1), options);
  }
  if (color.length === 3) {
    return normalizeHexColor(
      color
        .split('')
        .map((c) => c + c)
        .join(''),
      options,
    );
  } else if (color.length === 6) {
    return {
      r: parseInt(color.slice(0, 2), 16) & 0xff,
      g: parseInt(color.slice(2, 4), 16) & 0xff,
      b: parseInt(color.slice(4, 6), 16) & 0xff,
      options: options || {},
    };
  }
  throw new Error(`Invalid hex color: ${color}`);
}

export function hexToRgbTuple(color: string): RgbTuple {
  const normalized = normalizeHexColor(color);
  return [normalized.r, normalized.g, normalized.b] as const;
}
