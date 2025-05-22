import { RgbTuple } from '../../types';
import { SimpleFrame } from '../simple-frame';
import { clampRgb } from '../../utils';
import { assertFpsBelow100 } from '../helpers/assert-fps-below-100';
import { assert } from 'tsafe';

export function morphMany(
  tuples: RgbTuple[],
  overMs: number,
  steps = overMs / 17,
): Iterable<SimpleFrame> {
  assert(tuples.length > 1, 'At least two tuples are required for morphing.');
  assertFpsBelow100(overMs, steps);
  const segments = tuples.length - 1;
  const baseSteps = Math.floor(steps / segments);
  const totalStepsAllocated = baseSteps * segments;
  // Distribute the remaining frames to the last segment
  const remainder = steps - totalStepsAllocated;
  const stepDuration = overMs / steps;

  return {
    *[Symbol.iterator]() {
      for (let i = 0; i < segments; i++) {
        const from = tuples[i];
        const to = tuples[i + 1];
        const segmentSteps = i === segments - 1 ? baseSteps + remainder : baseSteps;
        for (let j = 0; j < segmentSteps; j++) {
          const ratio = j / (segmentSteps - 1);
          const r = clampRgb(Math.round(from[0] + (to[0] - from[0]) * ratio));
          const g = clampRgb(Math.round(from[1] + (to[1] - from[1]) * ratio));
          const b = clampRgb(Math.round(from[2] + (to[2] - from[2]) * ratio));
          yield new SimpleFrame([r, g, b], stepDuration);
        }
      }
    },
  };
}
