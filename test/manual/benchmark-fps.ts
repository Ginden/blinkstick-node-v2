import { BlinkStick } from '../../src';
import { performance } from 'node:perf_hooks';

type DecileStats = { min: number; max: number; average: number };

/**
 * Measures the practical frames-per-second a BlinkStick device can sustain by
 * rapidly toggling its colour and recording the time difference between
 * successive `setColor` calls.
 *
 * The function returns:
 *   • `average`   – mean frame duration in milliseconds.
 *   • `deciles[]` – 10 buckets (0-10 %, 10-20 %, … 90-100 %) each with min/max
 *                   and mean duration observed inside that bucket.  This helps
 *                   to see the tail-latency distribution instead of just an
 *                   overall average.
 */
export async function benchmarkFps(
  blinkstickDevice: BlinkStick,
  frames = 300,
): Promise<{ deciles: DecileStats[]; average: number }> {
  const leds = blinkstickDevice.leds();

  // If LEDs group is not available (e.g. inverse mode) bail out.
  if (!leds) {
    throw new Error('Cannot benchmark FPS – led group not available');
  }

  const colours = ['red', 'green', 'black', 'white'] as const;
  const samples: number[] = [];

  let last = performance.now();
  // First colour set (does not yield a sample).
  await leds.setColor(colours[0]);

  for (let i = 1; i <= frames; i += 1) {
    await leds.setColor(colours[i % 2]);
    const now = performance.now();
    samples.push(now - last);
    last = now;
  }

  // Calculate average.
  const average = samples.reduce((a, b) => a + b, 0) / samples.length;

  // Build deciles (10 equal-sized buckets of the *sorted* samples).
  const sorted = samples.slice().sort((a, b) => a - b);
  const deciles: DecileStats[] = [];
  const bucketSize = Math.floor(sorted.length / 10) || 1;

  for (let d = 0; d < 10; d += 1) {
    const start = d * bucketSize;
    const end = d === 9 ? sorted.length : start + bucketSize; // last bucket gets the remainder
    const slice = sorted.slice(start, end);
    deciles.push({
      min: Math.min(...slice),
      max: Math.max(...slice),
      average: slice.reduce((a, b) => a + b, 0) / slice.length,
    });
  }

  return { deciles, average };
}
