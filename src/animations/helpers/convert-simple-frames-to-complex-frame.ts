import { SimpleFrame } from '../simple-frame';
import { ComplexFrame } from '../complex-frame';
import { RgbTuple } from '../../types';
import { assert } from 'tsafe';

interface LedState {
  frames: SimpleFrame[];
  index: number; // index of *current* simple frame in `frames`
  remaining: number; // remaining time of the current frame (0 when finished)
  startedAtBoundary: boolean; // whether the current frame began at the previous boundary
  lastRgb: RgbTuple; // colour that should be displayed once the animation finishes
}

/**
 * Implementation that follows the expectations expressed in
 * `convert-simple-frames-to-complex-frame.test.ts`.
 *
 * 1. A complex frame is emitted whenever *any* LED changes its colour.
 * 2. If a LED changes its colour, **all other LEDs** that still have at least
 *    one more simple frame will also transition to their next frame – even if
 *    their current one has not finished yet. This keeps colour-changes across
 *    LEDs perfectly aligned (see the third test case).
 * 3. When a LED runs out of simple frames it continues to show the colour of
 *    its *last* frame.
 */
export function convertSimpleFramesToComplexFrame1(
  simpleFrames: Exclude<Iterable<SimpleFrame>, Generator>[],
  fillMissingEndWith: RgbTuple = [0, 0, 0],
  ledCount: number = simpleFrames.length,
): Iterable<ComplexFrame> {
  assert(ledCount > 0, 'ledCount must be greater than 0');
  assert(simpleFrames.length === ledCount, 'simpleFrames length must be equal to ledCount');

  const perLedFrames: SimpleFrame[][] = simpleFrames.map((iter) =>
    Array.isArray(iter) ? iter.slice() : Array.from(iter),
  );

  return {
    *[Symbol.iterator](): Generator<ComplexFrame> {
      // Initialise LED states
      const states: LedState[] = perLedFrames.map((frames): LedState => {
        if (frames.length === 0) {
          return {
            frames,
            index: 0,
            remaining: 0,
            startedAtBoundary: false,
            lastRgb: fillMissingEndWith,
          };
        }
        return {
          frames,
          index: 0,
          remaining: frames[0].duration,
          startedAtBoundary: false,
          lastRgb: frames[frames.length - 1].rgb,
        };
      });

      const colourBuffer: RgbTuple[] = Array.from({ length: ledCount }, () => [
        ...fillMissingEndWith,
      ]) as RgbTuple[];

      while (true) {
        // Determine the minimum positive remaining time amongst *active* LEDs.
        let minStep = Number.POSITIVE_INFINITY;
        for (const s of states) {
          if (s.remaining > 0 && s.remaining < minStep) {
            minStep = s.remaining;
          }
        }

        // If every LED finished -> stop iteration.
        if (!Number.isFinite(minStep)) {
          break;
        }

        // Snapshot colours for the upcoming complex frame.
        for (let i = 0; i < ledCount; i++) {
          const st = states[i];
          if (st.remaining === 0) {
            colourBuffer[i] = st.lastRgb;
          } else {
            colourBuffer[i] = st.frames[st.index].rgb;
          }
        }

        yield new ComplexFrame(colourBuffer.slice(), minStep);

        // Flag to indicate that at least one LED ends *naturally* with this slice.
        let someLedEnded = false;
        for (const st of states) {
          if (st.remaining === minStep && st.remaining > 0) {
            someLedEnded = true;
            break;
          }
        }

        // Update LED states.
        for (const st of states) {
          if (st.remaining === 0) {
            continue; // already finished; colour frozen in `lastRgb`.
          }

          const naturalEnd = st.remaining === minStep;
          const shouldCut =
            !naturalEnd && st.startedAtBoundary && someLedEnded && st.index + 1 < st.frames.length;

          if (naturalEnd || shouldCut) {
            // Move to next frame if available.
            if (st.index + 1 < st.frames.length) {
              st.index += 1;
              st.remaining = Math.min(
                st.frames[st.index].duration,
                shouldCut ? minStep : st.frames[st.index].duration,
              );
              st.startedAtBoundary = true;
            } else {
              // No more frames for this LED.
              st.remaining = 0;
              st.startedAtBoundary = false;
            }
          } else {
            // Continue current frame.
            st.remaining -= minStep;
            st.startedAtBoundary = false;
          }
        }
      }
    },
  };
}
