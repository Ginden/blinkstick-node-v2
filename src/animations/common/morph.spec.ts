import { describe, it, expect } from 'vitest';
import { morph } from './morph';

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

  it('yields default steps of 100 frames', () => {
    const frames = Array.from(morph([0, 0, 0], [100, 100, 100], 200));
    expect(frames).toHaveLength(100);
  });
});
