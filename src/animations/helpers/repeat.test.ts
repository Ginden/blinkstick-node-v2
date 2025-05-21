import { describe, it, expect } from 'vitest';
import { repeat } from '../../index';
import { SimpleFrame } from '../../index';
import {asyncCollect} from "./iterate";

describe('repeat', () => {
  async function* base() {
    yield new SimpleFrame([1, 1, 1], 10);
    yield new SimpleFrame([2, 2, 2], 20);
  }

  it('throws if times <= 0', () => {
    expect(() => repeat(base(), 0)).toThrowError();
  });

  it('returns the same animation for times=1', async () => {
    const frames: SimpleFrame[] = [];
    for await (const frame of repeat(base(), 1)) {
      frames.push(frame as SimpleFrame);
    }
    expect(frames.map((f) => f.rgb)).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });

  it('repeats the animation twice for times=2', async () => {
    // This one fails
    const frames: SimpleFrame[] = await asyncCollect(repeat(() => base(), 2)) as SimpleFrame[];
    const actual = frames.map((f) => f.rgb);
    const expected = [
        [1, 1, 1],
        [2, 2, 2],
        [1, 1, 1],
        [2, 2, 2],
    ] as const;


    expect(actual.length).toEqual(expected.length);

    expect(actual).toEqual(expected);
  });
});
