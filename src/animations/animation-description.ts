import { ColorInput } from '../types';
import { pulse } from './common/pulse';
import { repeat } from './helpers/repeat';
import { parseSaneColorParam } from '../utils/colors/parse-sane-color-param';
import { morph } from './common/morph';
import { morphMany } from './common/morph-many';
import { Frame } from './frame';
import { assertFpsBelow100 } from './helpers/assert-fps-below-100';

export abstract class Animation {
  static repeat(animation: FrameIterable, repeatCount: number) {
    return repeat(animation, repeatCount);
  }

  static pulse(
    color: ColorInput,
    overMs: number,
    steps: number = overMs / 60,
    repeatCount: number = 1,
  ) {
    assertFpsBelow100(overMs, steps);
    const actualColorTuple = parseSaneColorParam(color);
    const pulseIterator = pulse(actualColorTuple, { steps, overMs });
    if (repeatCount === 1) {
      return pulseIterator;
    }
    return repeat(pulseIterator, repeatCount);
  }

  static morph(
    from: ColorInput,
    to: ColorInput,
    overMs: number,
    steps: number = overMs / 60,
  ): FrameIterable {
    assertFpsBelow100(overMs, steps);
    const baseRgb = parseSaneColorParam(from);
    const targetRgb = parseSaneColorParam(to);
    return morph(baseRgb, targetRgb, overMs, steps);
  }

  static morphMany(tuples: ColorInput[], overMs: number, steps = overMs / 60) {
    assertFpsBelow100(overMs, steps);
    return morphMany(tuples.map(parseSaneColorParam), overMs, steps);
  }
}

export type FrameIterable = Iterable<Frame> | AsyncIterable<Frame>;
