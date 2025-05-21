import { SimpleFrame } from './simple-frame';
import { ComplexFrame } from './complex-frame';
import { RgbTuple } from '../types';
import { assert } from 'tsafe';

export async function* convertSimpleFramesToComplexFrame1(
  simpleFrames: Iterable<SimpleFrame>[],
  fillMissingEndWith: RgbTuple = [0, 0, 0],
  ledCount: number = simpleFrames.length,
): AsyncIterable<ComplexFrame> {
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
    colors[i] = [...fillMissingEndWith]; // Default to fill color
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
    yield new ComplexFrame([...colors], minTimeStep);
  }
}

export async function* convertSimpleFramesToComplexFrame2(
  simpleFrames: (Iterable<SimpleFrame> | AsyncIterable<SimpleFrame>)[],
  fillMissingEndWith: RgbTuple = [0, 0, 0],
  ledCount: number = simpleFrames.length,
): AsyncIterable<ComplexFrame> {
  assert(ledCount > 0, 'ledCount must be greater than 0');
  assert(simpleFrames.length === ledCount, 'simpleFrames length must be equal to ledCount');

  const iterators: (AsyncIterator<SimpleFrame> | Iterator<SimpleFrame>)[] = simpleFrames.map(
    (iterable) => {
      if (Symbol.asyncIterator in iterable) {
        return (iterable as AsyncIterable<SimpleFrame>)[Symbol.asyncIterator]();
      }
      return (iterable as Iterable<SimpleFrame>)[Symbol.iterator]();
    },
  );

  const currentFrames: (SimpleFrame | null)[] = new Array(ledCount).fill(null);
  const remainingDurations: number[] = new Array(ledCount).fill(0);
  let activeIteratorsCount = 0;

  // Initialize first frames
  for (let i = 0; i < ledCount; i++) {
    const iteratorResult = await iterators[i].next();
    if (!iteratorResult.done) {
      currentFrames[i] = iteratorResult.value;
      remainingDurations[i] = iteratorResult.value.duration;
      activeIteratorsCount++;
    } else {
      remainingDurations[i] = Infinity; // Mark as finished
    }
  }

  // Pre-allocate colors array for ComplexFrame to avoid reallocation in the loop
  const complexFrameColors: RgbTuple[] = new Array(ledCount);

  while (activeIteratorsCount > 0) {
    let minRemainingDuration = Infinity;
    for (let i = 0; i < ledCount; i++) {
      if (currentFrames[i] !== null) {
        // Only consider active LEDs with a current frame
        minRemainingDuration = Math.min(minRemainingDuration, remainingDurations[i]);
      }
    }

    // If all remaining durations are Infinity, it means all active iterators have finished
    // but we might have caught them before activeIteratorsCount was decremented.
    // This can happen if the last active iterators finish simultaneously.
    if (minRemainingDuration === Infinity && activeIteratorsCount > 0) {
      // This state implies that some iterators might have just finished,
      // and we need to re-evaluate activeIteratorsCount based on currentFrames.
      let currentActive = 0;
      for (let i = 0; i < ledCount; i++) {
        if (currentFrames[i] !== null) {
          currentActive++;
        }
      }
      if (currentActive === 0) break; // All truly done
      // If not all are truly done, there's an issue or an edge case not handled.
      // For safety, if minRemainingDuration is Infinity but activeIteratorsCount > 0,
      // and currentActive is also > 0, it implies a logic error or infinite duration frames not properly handled.
      // However, our current logic assumes finite durations or iterators eventually ending.
      // If a simple frame could have Infinity duration, this part needs refinement.
      // For now, we'll break if no actual frames are processable.
      if (currentActive === 0 || minRemainingDuration === Infinity) break;
    }

    if (minRemainingDuration === 0) {
      // Handle zero-duration frames by advancing them immediately
      for (let i = 0; i < ledCount; i++) {
        if (currentFrames[i] !== null && remainingDurations[i] === 0) {
          const iteratorResult = await iterators[i].next();
          if (!iteratorResult.done) {
            currentFrames[i] = iteratorResult.value;
            remainingDurations[i] = iteratorResult.value.duration;
            // If new duration is also 0, it will be handled in the next iteration
          } else {
            currentFrames[i] = null;
            remainingDurations[i] = Infinity; // Mark as finished
            activeIteratorsCount--;
          }
        }
      }
      if (activeIteratorsCount === 0) break; // All iterators might have finished with 0-duration frames
      continue; // Re-evaluate minRemainingDuration
    }

    for (let i = 0; i < ledCount; i++) {
      if (currentFrames[i]) {
        complexFrameColors[i] = currentFrames[i]!.rgb;
      } else {
        complexFrameColors[i] = fillMissingEndWith;
      }
    }

    yield new ComplexFrame(
      [...complexFrameColors], // Create a new array for the frame
      minRemainingDuration,
    );

    for (let i = 0; i < ledCount; i++) {
      if (currentFrames[i]) {
        remainingDurations[i] -= minRemainingDuration;
        if (remainingDurations[i] <= 0) {
          // Use <= to handle potential floating point inaccuracies
          const iteratorResult = await iterators[i].next();
          if (!iteratorResult.done) {
            currentFrames[i] = iteratorResult.value;
            remainingDurations[i] = iteratorResult.value.duration + remainingDurations[i]; // Add leftover negative time if any (usually 0)
            if (remainingDurations[i] < 0) remainingDurations[i] = 0; // Ensure duration isn't negative
          } else {
            currentFrames[i] = null;
            remainingDurations[i] = Infinity; // Mark as finished
            activeIteratorsCount--;
          }
        }
      }
    }
  }
}

export async function* convertSimpleFramesToComplexFrame3(
  simpleFrames: Iterable<SimpleFrame>[],
  fillMissingEndWith: RgbTuple = [0, 0, 0],
  ledCount: number = simpleFrames.length,
): AsyncIterable<ComplexFrame> {
  assert(ledCount > 0, 'ledCount must be greater than 0');
  assert(simpleFrames.length === ledCount, 'simpleFrames length must be equal to ledCount');

  const iters = simpleFrames.map((s) => s[Symbol.iterator]());
  const remaining = new Array<number>(ledCount); // ms left in current frame
  const colours = new Array<RgbTuple>(ledCount); // current colour for each LED

  // prime iterators
  for (let i = 0; i < ledCount; i++) {
    const n = iters[i].next();
    if (n.done) {
      remaining[i] = Number.POSITIVE_INFINITY;
      colours[i] = fillMissingEndWith;
    } else {
      remaining[i] = n.value.duration;
      colours[i] = n.value.rgb;
    }
  }

  while (true) {
    // next slice length = smallest finite remaining duration
    let slice = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ledCount; i++) {
      if (remaining[i] < slice) slice = remaining[i];
    }
    if (!isFinite(slice)) break; // all streams ended

    // emit slice
    yield new ComplexFrame(colours.slice(), slice);

    // advance each LED timeline
    for (let i = 0; i < ledCount; i++) {
      if (!isFinite(remaining[i])) continue; // already finished
      remaining[i] -= slice;
      if (remaining[i] === 0) {
        // frame exhausted
        const n = iters[i].next();
        if (n.done) {
          remaining[i] = Number.POSITIVE_INFINITY;
          colours[i] = fillMissingEndWith;
        } else {
          remaining[i] = n.value.duration;
          colours[i] = n.value.rgb;
        }
      }
    }
  }
}
