import { describe, it, expect } from 'vitest';
import { convertSimpleFramesToComplexFrame1 } from './convert-simple-frames-to-complex-frame';
import { SimpleFrame } from '../simple-frame';
import { ComplexFrame } from '../complex-frame';
import {RgbTuple} from "../../types";

describe('convertSimpleFramesToComplexFrame1', () => {
  it('converts simple frames to a single complex frame', async () => {
    const sf1 = [new SimpleFrame([1, 1, 1], 10)];
    const sf2 = [new SimpleFrame([2, 2, 2], 10)];
    const frames: ComplexFrame[] = [];
    for await (const frame of convertSimpleFramesToComplexFrame1([sf1, sf2])) {
      frames.push(frame);
    }
    expect(frames).toHaveLength(1);
    expect(frames[0].duration).toBe(10);
    expect(frames[0].colors).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });

  it('fills missing LEDs with fillMissingEndWith after exhaustion', async () => {
    const sf1 = [new SimpleFrame([1, 1, 1], 5)];
    const sf2 = [new SimpleFrame([2, 2, 2], 5), new SimpleFrame([3, 3, 3], 5)];
    const fill = [9, 9, 9] as RgbTuple;
    const frames: ComplexFrame[] = [];
    for await (const frame of convertSimpleFramesToComplexFrame1([sf1, sf2], fill)) {
      frames.push(frame);
    }
    expect(frames).toHaveLength(2);
    expect(frames[0].colors).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
    expect(frames[0].duration).toBe(5);
    expect(frames[1].colors).toEqual([
      [9, 9, 9],
      [3, 3, 3],
    ]);
    expect(frames[1].duration).toBe(5);
  });
});
