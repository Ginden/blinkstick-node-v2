import { describe, it, expect } from 'vitest';
import { colorInputToRgbTuple } from './color-input-to-rgb-tuple';

describe('parseSaneColorParam', () => {
  it('converts array of numbers to [r, g, b]', () => {
    expect(colorInputToRgbTuple([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('converts color name to [r, g, b]', () => {
    expect(colorInputToRgbTuple('red')).toEqual([255, 0, 0]);
    expect(colorInputToRgbTuple('aqua')).toEqual([0, 255, 255]);
  });

  it('throws on invalid color format', () => {
    // @ts-expect-error invalid input
    expect(() => colorInputToRgbTuple('not-a-color')).toThrow(TypeError);
  });
});
