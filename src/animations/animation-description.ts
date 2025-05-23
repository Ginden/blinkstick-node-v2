import { ColorInput } from '../types';
import { pulse } from './common/pulse';
import { repeat } from './helpers/repeat';
import { colorInputToRgbTuple } from '../utils/colors/color-input-to-rgb-tuple';
import { morph } from './common/morph';
import { morphMany } from './common/morph-many';
import { Frame } from './frame/frame';
import { assertFpsBelow100 } from './helpers/assert-fps-below-100';

export abstract class Animation {
  /**
   * Shorthand for `repeat`
   * @param animation
   * @param repeatCount
   */
  static repeat(animation: FrameIterable, repeatCount: number) {
    return repeat(animation, repeatCount);
  }

  /**
   * Shorthand for `repeat(pulse(color, overMs, steps), repeatCount)`
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
   * Shorthand for `morph(from, to, overMs, steps)`
   * @param from
   * @param to
   * @param overMs
   * @param steps
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
   * Shorthand for `morphMany(tuples, overMs, steps)`
   * @param tuples
   * @param overMs
   * @param steps
   */
  static morphMany(tuples: ColorInput[], overMs: number, steps = overMs / 17) {
    assertFpsBelow100(overMs, steps);
    return morphMany(tuples.map(colorInputToRgbTuple), overMs, steps);
  }
}

export type FrameIterable = Iterable<Frame> | AsyncIterable<Frame>;
