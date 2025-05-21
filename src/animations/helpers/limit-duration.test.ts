import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { limitDuration } from './limit-duration';
import { SimpleFrame } from '../simple-frame';

describe('limitDuration', () => {
  beforeEach(() => {
    vi.spyOn(performance, 'now').mockImplementation(() => 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(frames.map((f) => f.duration)).toEqual([10, 15]);
    expect(frames.map((f) => f.rgb)).toEqual([
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });
});
