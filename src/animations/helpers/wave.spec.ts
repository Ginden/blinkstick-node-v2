import { describe, it, expect } from 'vitest';
import { ComplexFrame, wave, WaveOptions } from '../../index';
import { SimpleFrame } from '../../index';
import { asyncCollect } from './iterate';

describe(wave.name, () => {
  it('throws if ledCount <= 0', () => {
    expect(() => wave([], { ledCount: 0, lagMs: 100 })).toThrowError(
      'ledCount must be greater than 0',
    );
  });
  it('throws if lagMs < 0', () => {
    expect(() => wave([], { ledCount: 1, lagMs: -1 })).toThrowError(
      'lagMs must be greater than or equal to 0',
    );
  });

  const frameDurations = Array.from({ length: 3 }, () => (50 + Math.random() * 1000) | 0).sort(
    (a, b) => a - b,
  );

  const lags = Array.from({ length: 3 }, () => (10 + Math.random() * Math.random() * 300) | 0).sort(
    (a, b) => a - b,
  );

  for (const ledCount of [2, 4, 8, 16]) {
    for (const frameDuration of frameDurations) {
      for (const lagMs of lags)
        it(`Correctly applies wave effect (ledCount=${ledCount}, frameDuration=${frameDuration}, lagMs=${lagMs})`, async () => {
          const animation = [
            new SimpleFrame([255, 0, 0], frameDuration),
            new SimpleFrame([0, 0, 0], frameDuration),
          ];
          const options = { ledCount, lagMs, fillWith: [0, 0, 0] } satisfies WaveOptions;
          const frames = await asyncCollect(wave(animation, options));
          for (const f of frames) {
            expect(f).toBeInstanceOf(ComplexFrame);
            expect(f.colors).toHaveLength(ledCount);
          }
          const totalDuration = frames.reduce((acc, frame) => acc + frame.duration, 0);
          // 200 ms for the animation + but X th animation frame starts with delay of (x-1) * 50 ms
          expect(totalDuration).toEqual(2 * frameDuration + lagMs * (ledCount - 1));

          expect(frames[0].colors).toEqual([[255, 0, 0], ...Array(ledCount - 1).fill([0, 0, 0])]);
        });
    }
  }
});
