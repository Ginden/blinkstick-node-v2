export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Clamp a value to the range of 0-255
 * As integer, of course
 * @param value
 */
export function clampRgb(value: number): number {
  return clamp(value | 0, 0, 255);
}
