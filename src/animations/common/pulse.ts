import { SimpleFrame } from '../frame/simple-frame';
import { RgbTuple } from '../../types/rgb-tuple';
import { clampRgb } from '../../utils/clamp';
import assert from 'assert';
import { assertFpsBelow100 } from '../helpers/assert-fps-below-100';

export type PulseOptions = {
  steps?: number;
  overMs: number;
};

/**
 * Pulses a color and backs off to black.
 */
export function pulse(
  [r, g, b]: RgbTuple,
  { overMs, ...opts }: PulseOptions,
): Iterable<SimpleFrame> {
  assert(overMs > 0, 'overMs must be greater than 0');
  const { steps = overMs / 34 } = opts;
  assertFpsBelow100(overMs, steps);
  return {
    *[Symbol.iterator]() {
      const stepDuration = (overMs / (steps * 2)) | 0;
      for (let i = 0; i < steps; i++) {
        const brightness = i * (255 / steps);
        yield SimpleFrame.fromProperties({
          rgb: [clampRgb(r * brightness), clampRgb(g * brightness), clampRgb(b * brightness)],
          duration: stepDuration | 0,
        });
      }
      for (let i = steps - 1; i >= 0; i--) {
        const brightness = i * (255 / steps);
        yield SimpleFrame.fromProperties({
          rgb: [clampRgb(r * brightness), clampRgb(g * brightness), clampRgb(b * brightness)],
          duration: stepDuration | 0,
        });
      }
    },
  };
}
