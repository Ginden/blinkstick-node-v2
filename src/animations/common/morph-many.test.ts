import { describe, it, expect } from 'vitest';
import { morphMany } from './morph-many';
import { RgbTuple } from '../../types';

describe('morphMany', () => {
  it('yields correct number of frames and colors for custom steps', () => {
    const tuples = [
      [0, 0, 0],
      [10, 10, 10],
      [20, 20, 20],
    ] satisfies RgbTuple[];
    const frames = Array.from(morphMany(tuples, 60, 3));
    expect(frames).toHaveLength(6);
    expect(frames[0].rgb).toEqual([0, 0, 0]);
    expect(frames[2].rgb).toEqual([10, 10, 10]);
    expect(frames[3].rgb).toEqual([10, 10, 10]);
    expect(frames[5].rgb).toEqual([20, 20, 20]);
    expect(frames.every((f) => f.duration === 20)).toBe(true);
  });

  it('uses default steps as tuples.length * 50', () => {
    const tuples = [
      [0, 0, 0],
      [255, 0, 0],
    ] satisfies RgbTuple[];
    const frames = Array.from(morphMany(tuples, 100));
    expect(frames).toHaveLength(100);
  });
});
