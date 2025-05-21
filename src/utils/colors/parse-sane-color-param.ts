import { SaneColorParam } from '../../types';
import { COLOR_KEYWORDS } from '../../consts/color-keywords';
import { normalizeHexColor } from './normalize-hex-color';
import { RgbTuple } from '../../types/rgb-tuple';
import { typeGuard } from 'tsafe';

export function parseSaneColorParam(color: SaneColorParam): RgbTuple {
  if (
    typeof color === 'string' &&
    typeGuard<keyof typeof COLOR_KEYWORDS>(color, color in COLOR_KEYWORDS)
  ) {
    const { r, g, b } = normalizeHexColor(COLOR_KEYWORDS[color as keyof typeof COLOR_KEYWORDS]);
    return [r, g, b];
  }
  if (Array.isArray(color)) {
    return [color[0], color[1], color[2]];
  }
  if (typeof color === 'object') {
    return [color.r, color.g, color.b];
  }
  throw new TypeError(`Invalid color format`);
}
