import type { ColorInput } from '../types';
import { pulse } from './common/pulse';
import { repeat } from './helpers/repeat';
import { colorInputToRgbTuple } from '../utils/colors/color-input-to-rgb-tuple';
import { morph } from './common/morph';
import { morphMany } from './common/morph-many';
import type { Frame } from './frame/frame';
import { assertFpsBelow100 } from './helpers/assert-fps-below-100';

/**
 * @summary Bag of static methods for creating animations.
 * @remarks This class is a collection of static methods to create common animations.
 * You should use these methods to create animations easily.
 * @category Animation
 */
export abstract class Animation {
  /**
   * This class is not meant to be instantiated.
   * @private
   */
  private constructor() {}
  /**
   * @summary Shorthand for `repeat`
   * @param animation
   * @param repeatCount
   */
  static repeat(animation: FrameIterable, repeatCount: number) {
    return repeat(animation, repeatCount);
  }

  /**
   * @summary Shorthand for `repeat(pulse(color, overMs, steps), repeatCount)`
   */
  static pulse(
    color: ColorInput,
    overMs: number,
    steps: number = overMs / 17,
    repeatCount: number = 1,
  ) {
    assertFpsBelow100(overMs, steps);
    const actualColorTuple = colorInputToRgbTuple(color);
    const pulseIterator = pulse(actualColorTuple, { steps, overMs });
    if (repeatCount === 1) {
      return pulseIterator;
    }
    return repeat(pulseIterator, repeatCount);
  }

  /**
   * @summary Shorthand for `morph(from, to, overMs, steps)`
   */
  static morph(
    from: ColorInput,
    to: ColorInput,
    overMs: number,
    steps: number = overMs / 17,
  ): FrameIterable {
    assertFpsBelow100(overMs, steps);
    const baseRgb = colorInputToRgbTuple(from);
    const targetRgb = colorInputToRgbTuple(to);
    return morph(baseRgb, targetRgb, overMs, steps);
  }

  /**
   * @summary Shorthand for `morphMany(tuples, overMs, steps)`
   */
  static morphMany(tuples: ColorInput[], overMs: number, steps = overMs / 17) {
    assertFpsBelow100(overMs, steps);
    return morphMany(tuples.map(colorInputToRgbTuple), overMs, steps);
  }
}

/**
 * @category Animation
 */
export type FrameIterable = Iterable<Frame> | AsyncIterable<Frame>;
