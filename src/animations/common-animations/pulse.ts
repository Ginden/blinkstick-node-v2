import { SimpleFrame } from '../simple-frame';
import { RgbTuple } from '../../types/rgb-tuple';
import { clampRgb } from '../../utils/clamp';

export type PulseOptions = {
  steps: number;
  totalDuration: number;
};

export function* pulse([r, g, b]: RgbTuple, { steps, totalDuration }: PulseOptions) {
  const stepDuration = (totalDuration / (steps * 2)) | 0;
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
