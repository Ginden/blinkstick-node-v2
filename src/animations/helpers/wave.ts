import { SimpleFrame } from '../frame/simple-frame';
import { ComplexFrame } from '../frame/complex-frame';
import { RgbTuple } from '../../types';
import { assert } from 'tsafe';

export type WaveOptions = {
  fillWith?: RgbTuple;
  lagMs: number;
  ledCount: number;
};

/**
 * Build wave effect by time-line stitching – this guarantees the overall
 * duration is exactly:
 *    animationDuration + lagMs × (ledCount - 1)
 * and avoids the subtle frame-cutting rules of
 * `convertSimpleFramesToComplexFrame`.
 * @experimental
 * @category Animation
 */
export function wave(
  animation: Iterable<SimpleFrame>,
  { fillWith = [0, 0, 0] as const, ledCount, lagMs }: WaveOptions,
): Iterable<ComplexFrame> {
  assert(ledCount > 0, 'ledCount must be greater than 0');
  assert(lagMs >= 0, 'lagMs must be greater than or equal to 0');

  const srcFrames: SimpleFrame[] = Array.isArray(animation)
    ? (animation as SimpleFrame[]).slice()
    : Array.from(animation);

  if (srcFrames.length === 0) {
    return [];
  }

  // Pre-compute cumulative end-times of the source animation (relative to its
  // own start, i.e. LED-0).
  const cumulativeEnds: number[] = [0];
  for (const f of srcFrames) cumulativeEnds.push(cumulativeEnds.at(-1)! + f.duration);

  // Collect every timestamp at which *any* LED may change colour.
  const changeTs: number[] = [];
  for (let led = 0; led < ledCount; led += 1) {
    const offset = led * lagMs;
    for (const t of cumulativeEnds) changeTs.push(offset + t);
  }
  changeTs.sort((a, b) => a - b);
  // de-dupe
  const uniq: number[] = [];
  for (const t of changeTs) if (uniq[uniq.length - 1] !== t) uniq.push(t);

  // Helper: colour of given LED at (inclusive) time `t`.
  function colourAt(led: number, t: number): RgbTuple {
    const start = led * lagMs;
    if (t < start) return [...fillWith] as RgbTuple;
    let rel = t - start;
    for (const f of srcFrames) {
      if (rel < f.duration) return f.rgb;
      rel -= f.duration;
    }
    return srcFrames[srcFrames.length - 1].rgb;
  }

  return {
    *[Symbol.iterator](): Generator<ComplexFrame> {
      const MIN_MS = 10; // do not emit frames shorter than this

      let prev: ComplexFrame | null = null;

      for (let i = 0; i < uniq.length - 1; i += 1) {
        const start = uniq[i];
        const end = uniq[i + 1];
        const duration = end - start;

        const colours: RgbTuple[] = Array.from({ length: ledCount }, (_, led) =>
          colourAt(led, start),
        );

        const frame = new ComplexFrame(colours, duration);

        if (!prev) {
          prev = frame;
          continue;
        }

        if (frame.duration < MIN_MS) {
          // Merge very short slice into previous frame to avoid excessive FPS.
          prev.duration += frame.duration;
          continue;
        }

        // Emit previous frame now that we know the current one is long enough.
        yield prev;
        prev = frame;
      }

      if (prev) {
        yield prev;
      }
    },
  };
}
