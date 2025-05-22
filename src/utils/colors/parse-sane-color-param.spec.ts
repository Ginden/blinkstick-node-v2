import { describe, it, expect } from 'vitest';
import { parseSaneColorParam } from './parse-sane-color-param';

describe('parseSaneColorParam', () => {
  it('converts array of numbers to [r, g, b]', () => {
    expect(parseSaneColorParam([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('converts color name to [r, g, b]', () => {
    expect(parseSaneColorParam('red')).toEqual([255, 0, 0]);
    expect(parseSaneColorParam('aqua')).toEqual([0, 255, 255]);
  });

  it('throws on invalid color format', () => {
    // @ts-expect-error invalid input
    expect(() => parseSaneColorParam('not-a-color')).toThrow(TypeError);
  });
});
