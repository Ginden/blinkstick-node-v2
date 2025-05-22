import { describe, it, expect } from 'vitest';
import { morph } from './morph';
import { RgbTuple } from '../../types';

describe('morph', () => {
  it('throws if steps <= 0', () => {
    expect(() => Array.from(morph([0, 0, 0], [1, 1, 1], 100, 0))).toThrowError();
  });

  it('yields correct number of frames and colors for custom steps', () => {
    const frames = Array.from(morph([0, 0, 0], [30, 60, 90], 100, 2));
    expect(frames).toHaveLength(2);
    expect(frames[0].rgb).toEqual([10, 20, 30]);
    expect(frames[1].rgb).toEqual([20, 40, 60]);
  });

  it('yields reasonable number of frames', () => {
    const frames = Array.from(morph([0, 0, 0], [100, 100, 100], 600));
    expect(frames.length).toBeLessThanOrEqual(40); // 15ms per frame, 600ms total
    expect(frames.length).toBeGreaterThanOrEqual(6); // 100ms per frame, 600ms total
  });

  it('handles black => white transition', () => {
    const black = [0, 0, 0] as RgbTuple;
    const white = [255, 255, 255] as RgbTuple;
    const frames = Array.from(morph(black, white, 100, 5));
    expect(frames).toHaveLength(5);
  });
});
