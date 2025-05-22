import { describe, it, expect } from 'vitest';
import { morphMany } from './morph-many';
import { RgbTuple } from '../../types';
import { assert } from 'tsafe';

function collapseRgb([r, g, b]: RgbTuple) {
  assert(r === g);
  assert(g === b);
  return r;
}

describe('morphMany', () => {
  it('yields correct number of frames and colors for custom steps', () => {
    const tuples = [
      [0, 0, 0],
      [200, 200, 200],
      [100, 100, 100],
    ] satisfies RgbTuple[];
    const frames = Array.from(morphMany(tuples, 1000, 10));
    expect(frames.map((f) => collapseRgb(f.rgb))).toEqual([
      0, 50, 100, 150, 200, 200, 175, 150, 125, 100,
    ]);
    for (const frame of frames) {
      expect(frame.duration).toBe(100);
    }
  });

  it('takes as much time as it should', () => {
    const tuples = [
      [0, 0, 0],
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [255, 0, 255],
      [0, 255, 255],
    ] satisfies RgbTuple[];
    const frames = Array.from(morphMany(tuples, 5000));
    const totalDuration = frames.reduce((acc, frame) => acc + frame.duration, 0);
    expect(totalDuration).below(5000 * 1.05);
    expect(totalDuration).above(5000 * 0.95);
  });
});
