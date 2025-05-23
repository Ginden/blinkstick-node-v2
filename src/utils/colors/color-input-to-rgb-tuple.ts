import { ColorInput } from '../../types';
import { COLOR_KEYWORDS } from '../../consts/color-keywords';
import { normalizeHexColor } from './normalize-hex-color';
import { RgbTuple } from '../../types/rgb-tuple';
import { typeGuard } from 'tsafe';

export function colorInputToRgbTuple(color: ColorInput): RgbTuple {
  if (
    typeof color === 'string' &&
    typeGuard<keyof typeof COLOR_KEYWORDS>(color, color in COLOR_KEYWORDS)
  ) {
    const { r, g, b } = normalizeHexColor(COLOR_KEYWORDS[color as keyof typeof COLOR_KEYWORDS]);
    return [r, g, b];
  }
  if (Array.isArray(color)) {
    return [color[0] & 0xff, color[1] & 0xff, color[2] & 0xff];
  }
  if (typeof color === 'object') {
    return [color.r & 0xff, color.g & 0xff, color.b & 0xff];
  }
  throw new TypeError(`Invalid color format`);
}
