import { AllPossibleColorOptions, NormalizedColorOptions } from '../types/color-options';

export function normalizeHexColor(
  color: string,
  options?: AllPossibleColorOptions,
): NormalizedColorOptions {
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
      red: parseInt(color.slice(0, 2), 16),
      green: parseInt(color.slice(2, 4), 16),
      blue: parseInt(color.slice(4, 6), 16),
      options: options || {},
    };
  }
  throw new Error(`Invalid hex color: ${color}`);
}
