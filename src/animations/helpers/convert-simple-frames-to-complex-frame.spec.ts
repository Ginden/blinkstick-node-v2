import { describe, it, expect } from 'vitest';
import { convertSimpleFramesToComplexFrame1 } from './convert-simple-frames-to-complex-frame';
import { SimpleFrame } from '../simple-frame';
import { ComplexFrame } from '../complex-frame';
import { asyncCollect } from './iterate';

describe('convertSimpleFramesToComplexFrame1', () => {
  it('converts simple frames to a single complex frame', async () => {
    const sf1 = [new SimpleFrame([1, 1, 1], 10)];
    const sf2 = [new SimpleFrame([2, 2, 2], 10)];
    const frames: ComplexFrame[] = await asyncCollect(
      convertSimpleFramesToComplexFrame1([sf1, sf2]),
    );
    expect(frames).toHaveLength(1);
    expect(frames[0].duration).toBe(10);
    expect(frames[0].colors).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });

  it('converts few simple frames to a few complex frame', async () => {
    const sf1 = [new SimpleFrame([1, 1, 1], 10), new SimpleFrame([2, 2, 2], 10)];
    const sf2 = [new SimpleFrame([3, 3, 3], 20)];
    const frames: ComplexFrame[] = await asyncCollect(
      convertSimpleFramesToComplexFrame1([sf1, sf2]),
    );
    expect(frames).toHaveLength(2);
    const [firstFrame, secondFrame] = frames;
    expect(firstFrame.duration).toBe(10);
    expect(firstFrame.colors).toEqual([
      [1, 1, 1],
      [3, 3, 3],
    ]);
    expect(secondFrame.duration).toBe(10);
    expect(secondFrame.colors).toEqual([
      [2, 2, 2],
      [3, 3, 3],
    ]);
  });

  it('converts frames of unequal length', async () => {
    const sf1 = [
      new SimpleFrame([1, 1, 1], 10),
      new SimpleFrame([2, 2, 2], 10),
      new SimpleFrame([3, 3, 3], 10),
    ];
    const sf2 = [new SimpleFrame([4, 4, 4], 15), new SimpleFrame([5, 5, 5], 15)];
    const frames: ComplexFrame[] = await asyncCollect(
      convertSimpleFramesToComplexFrame1([sf1, sf2]),
    );
    expect(frames).toHaveLength(4);
    const [firstFrame, secondFrame, thirdFrame, fourthFrame] = frames;
    expect(firstFrame.duration).toBe(10);
    expect(firstFrame.colors).toEqual([
      [1, 1, 1],
      [4, 4, 4],
    ]);

    expect(secondFrame.duration).toBe(5);
    expect(secondFrame.colors).toEqual([
      [2, 2, 2],
      [4, 4, 4],
    ]);

    expect(thirdFrame.duration).toBe(5);
    expect(thirdFrame.colors).toEqual([
      [3, 3, 3],
      [5, 5, 5],
    ]);

    expect(fourthFrame.duration).toBe(10);
    expect(fourthFrame.colors).toEqual([
      [3, 3, 3],
      [5, 5, 5],
    ]);
  });
});
