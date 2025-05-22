import { SimpleFrame } from '../simple-frame';
import { RgbTuple } from '../../types/rgb-tuple';
import { clampRgb } from '../../utils/clamp';
import assert from 'assert';

export type PulseOptions = {
  steps?: number;
  overMs: number;
};

export function* pulse(
  [r, g, b]: RgbTuple,
  { overMs, ...opts }: PulseOptions,
): Iterable<SimpleFrame> {
  assert(overMs > 0, 'overMs must be greater than 0');
  const { steps = overMs / 100 } = opts;
  assert(steps * 20 < overMs, 'Frame FPS is too high, please reduce steps or increase overMs');
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
}
