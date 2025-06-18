import { assert } from 'tsafe';

import type { FrameIterable } from '../animation-description';
import type { Frame } from '../frame/frame';
import { SimpleFrame } from '../frame/simple-frame';
import { ComplexFrame } from '../frame/complex-frame';
import { WaitFrame } from '../frame/wait-frame';
import type { RgbTuple } from '../../types';

type QueueItem = {
  frame: Frame;
  remaining: number; // milliseconds of this frame still not consumed
};

/**
 * Compute per-LED weighted average colour for the upcoming slice.
 *
 * While iterating we *do not* mutate the queue – that is handled by the caller.
 */
function buildAveragedFrame(
  queue: readonly QueueItem[],
  sliceDuration: number,
  lastKnownColours: RgbTuple[] | null,
): Frame {
  // Resolve LED count first – favour information from ComplexFrame, then
  // `lastKnownColours`, and finally fall back to 1 (uniform colour).
  let ledCount: number | null = null;
  for (const { frame } of queue) {
    if (frame instanceof ComplexFrame) {
      ledCount = frame.colors.length;
      break;
    }
  }
  if (ledCount === null && lastKnownColours) {
    ledCount = lastKnownColours.length;
  }
  if (ledCount === null) ledCount = 1; // uniform single LED assumption

  // Running sums per LED per channel.
  const sums: number[][] = Array.from({ length: ledCount }, () => [0, 0, 0]);

  let needed = sliceDuration;
  let idx = 0;

  while (needed > 0 && idx < queue.length) {
    const { frame, remaining } = queue[idx];
    const consume = Math.min(remaining, needed);

    // Helper to accumulate given rgb(s):
    const accumulate = (rgb: RgbTuple | RgbTuple[]) => {
      if (Array.isArray(rgb[0])) {
        // Complex – per LED array
        const arr = rgb as RgbTuple[];
        for (let led = 0; led < ledCount!; led += 1) {
          const col = arr[led] ?? (arr.length > 0 ? arr[arr.length - 1] : [0, 0, 0]);
          sums[led][0] += col[0] * consume;
          sums[led][1] += col[1] * consume;
          sums[led][2] += col[2] * consume;
        }
      } else {
        // Simple – same colour for every LED
        const col = rgb as RgbTuple;
        for (let led = 0; led < ledCount!; led += 1) {
          sums[led][0] += col[0] * consume;
          sums[led][1] += col[1] * consume;
          sums[led][2] += col[2] * consume;
        }
      }
    };

    if (frame instanceof SimpleFrame) {
      accumulate(frame.rgb);
    } else if (frame instanceof ComplexFrame) {
      accumulate(frame.colors);
    } else if (frame instanceof WaitFrame) {
      // WaitFrame keeps previous colours.
      if (lastKnownColours) {
        accumulate(lastKnownColours);
      } else {
        accumulate([0, 0, 0]);
      }
    }

    needed -= consume;
    idx += 1;
  }

  // Derive averaged colours.
  const averaged: RgbTuple[] = sums.map((sum) => [
    Math.round(sum[0] / sliceDuration),
    Math.round(sum[1] / sliceDuration),
    Math.round(sum[2] / sliceDuration),
  ]) as RgbTuple[];

  const isUniform = averaged.every(
    (c) => c[0] === averaged[0][0] && c[1] === averaged[0][1] && c[2] === averaged[0][2],
  );

  return isUniform && ledCount === 1
    ? new SimpleFrame(averaged[0], sliceDuration)
    : new ComplexFrame(averaged, sliceDuration);
}

/**
 * **Streaming** FPS smoother.
 *
 * Guarantees that no more than `maxFps` frames per second are produced **while
 * preserving the original animation duration**. Colours inside every output
 * slice are calculated as the duration-weighted average of the covered source
 * frames. Works with both `Iterable` and `AsyncIterable` sources.
 *
 * @experimental
 * @category Animation
 */
export function smoothFps(animation: FrameIterable, maxFps = 60): AsyncIterable<Frame> {
  assert(maxFps > 0, 'maxFps must be greater than 0');
  const SLICE = 1000 / maxFps;

  return {
    [Symbol.asyncIterator]: async function* (): AsyncGenerator<Frame> {
      const iterator = (async function* () {
        for await (const f of animation) {
          yield f;
        }
      })();

      const queue: QueueItem[] = [];
      let sourceDone = false;
      let lastKnownColours: RgbTuple[] | null = null;

      while (true) {
        // Fill queue until we have at least one full slice worth of time or source ends.
        let queuedDuration = queue.reduce((sum, q) => sum + q.remaining, 0);

        while (!sourceDone && queuedDuration < SLICE) {
          const { value, done } = await iterator.next();
          if (done) {
            sourceDone = true;
            break;
          }

          const frame: Frame = value;
          queue.push({ frame, remaining: frame.duration });
          queuedDuration += frame.duration;

          if (frame instanceof SimpleFrame) {
            lastKnownColours = [frame.rgb];
          } else if (frame instanceof ComplexFrame) {
            lastKnownColours = frame.colors.slice();
          }
        }

        if (queue.length === 0) {
          // No work left – exit.
          break;
        }

        const sliceDuration = sourceDone && queuedDuration < SLICE ? queuedDuration : SLICE;

        // Build and emit averaged frame.
        const outFrame = buildAveragedFrame(queue, sliceDuration, lastKnownColours);
        yield outFrame;

        // Consume time from queue.
        let consume = sliceDuration;
        while (consume > 0 && queue.length) {
          const head = queue[0];
          if (head.remaining <= consume) {
            consume -= head.remaining;
            queue.shift();
          } else {
            head.remaining -= consume;
            consume = 0;
          }
        }
      }
    },
  };
}
