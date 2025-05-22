import { assert } from 'tsafe';
import { RgbTuple } from '../../types/rgb-tuple';
import { clampRgb } from '../../utils/clamp';
import { SimpleFrame } from '../simple-frame';

/**
 * Adds intermediate frames between two RGB colors.
 * @param from
 * @param to
 * @param overMs
 * @param steps
 */
export function morph(
  from: RgbTuple,
  to: RgbTuple,
  overMs: number,
  steps = 100,
): Iterable<SimpleFrame> {
  assert(steps > 0, 'steps must be greater than 0');
  return {
    *[Symbol.iterator]() {
      const stepDuration = overMs / steps;

      for (let i = 0; i < steps; i++) {
        const ratio = (i + 1) / (steps + 1);
        const r = clampRgb(from[0] + (to[0] - from[0]) * ratio);
        const g = clampRgb(from[1] + (to[1] - from[1]) * ratio);
        const b = clampRgb(from[2] + (to[2] - from[2]) * ratio);
        yield new SimpleFrame([r, g, b], stepDuration);
      }
    },
  };
}
