import { describe, it, expect } from 'vitest';
import { limitDuration } from './limit-duration';
import { SimpleFrame } from '../simple-frame';

describe('limitDuration', () => {
  async function* makeFrames() {
    yield new SimpleFrame([1, 1, 1], 10);
    yield new SimpleFrame([2, 2, 2], 20);
  }

  it('yields all frames unchanged if total duration <= max', async () => {
    const frames: SimpleFrame[] = [];
    for await (const frame of limitDuration(makeFrames(), 30)) {
      frames.push(frame as SimpleFrame);
    }
    expect(frames.map((f) => f.duration)).toEqual([10, 20]);
    expect(frames.map((f) => f.rgb)).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });

  it('truncates last frame if exceeding max', async () => {
    const frames: SimpleFrame[] = [];
    for await (const frame of limitDuration(makeFrames(), 15)) {
      frames.push(frame as SimpleFrame);
    }
    expect(frames.map((f) => f.duration)).toEqual([10, 5]);
    expect(frames.map((f) => f.rgb)).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });
});
