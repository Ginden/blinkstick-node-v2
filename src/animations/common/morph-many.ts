import { RgbTuple } from '../../types';
import { SimpleFrame } from '../simple-frame';
import { clampRgb } from '../../utils';

export function* morphMany(
  tuples: RgbTuple[],
  overMs: number,
  steps = tuples.length * 50,
): Iterable<SimpleFrame> {
  const stepDuration = overMs / steps;
  for (let i = 0; i < tuples.length - 1; i++) {
    const from = tuples[i];
    const to = tuples[i + 1];
    for (let j = 0; j < steps; j++) {
      const ratio = j / (steps - 1);
      const r = clampRgb(Math.round(from[0] + (to[0] - from[0]) * ratio));
      const g = clampRgb(Math.round(from[1] + (to[1] - from[1]) * ratio));
      const b = clampRgb(Math.round(from[2] + (to[2] - from[2]) * ratio));
      yield new SimpleFrame([r, g, b], stepDuration);
    }
  }
}
