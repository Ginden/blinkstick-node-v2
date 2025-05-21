import { SimpleFrame } from '../simple-frame';
import { ComplexFrame } from '../complex-frame';
import { RgbTuple } from '../../types';
import { assert } from 'tsafe';

export async function* convertSimpleFramesToComplexFrame1(
  simpleFrames: Iterable<SimpleFrame>[],
  fillMissingEndWith: RgbTuple = [0, 0, 0],
  ledCount: number = simpleFrames.length,
): AsyncIterable<ComplexFrame> {
  const [defaultR, defaultB, defaultG] = fillMissingEndWith;
  assert(ledCount > 0, 'ledCount must be greater than 0');
  assert(simpleFrames.length === ledCount, 'simpleFrames length must be equal to ledCount');

  // Create iterators for each simple animation
  const iterators = simpleFrames.map((frames) => {
    const iterator = frames[Symbol.iterator]();
    // Initialize with default state - currently active frame and remaining time
    return {
      iterator,
      currentFrame: iterator.next(),
      remainingTime: 0,
    };
  });

  // Cache for colors to avoid unnecessary allocations
  const colors: RgbTuple[] = Array(ledCount);
  for (let i = 0; i < ledCount; i++) {
    colors[i] = [defaultR, defaultG, defaultB]; // Default to fill color
  }

  // Track if all iterators are done
  let allDone = false;

  while (!allDone) {
    // Find the minimum time until next frame change across all LEDs
    let minTimeStep = Number.MAX_SAFE_INTEGER;
    allDone = true;

    // First pass: Calculate minimum time step and update remainingTime
    for (let i = 0; i < ledCount; i++) {
      const state = iterators[i];

      // Skip exhausted iterators
      if (state.currentFrame.done) {
        continue;
      }

      allDone = false; // At least one iterator is still active

      // If remainingTime is 0, we need to use the current frame's duration
      if (state.remainingTime === 0 && !state.currentFrame.done) {
        state.remainingTime = state.currentFrame.value.duration;
      }

      // Find the minimum remaining time across all active frames
      if (state.remainingTime > 0 && state.remainingTime < minTimeStep) {
        minTimeStep = state.remainingTime;
      }
    }

    // If all iterators are done, exit
    if (allDone) {
      break;
    }

    // Second pass: Populate colors array and update iterators
    for (let i = 0; i < ledCount; i++) {
      const state = iterators[i];

      if (!state.currentFrame.done) {
        // Set current color
        colors[i] = state.currentFrame.value.rgb;

        // Update remaining time and advance to next frame if needed
        state.remainingTime -= minTimeStep;
        if (state.remainingTime === 0) {
          state.currentFrame = state.iterator.next();
          // If the iterator is now done, keep the last color
        }
      }
      // If iterator is done, color stays the same (either last color or fillMissingEndWith)
    }

    // Create a new complex frame with the current colors and calculated duration
    yield new ComplexFrame(colors, minTimeStep);
  }
}
