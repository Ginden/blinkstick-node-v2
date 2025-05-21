import { SaneColorParam } from '../types';
import { SimpleFrame } from './simple-frame';
import { ComplexFrame } from './complex-frame';
import { pulse } from './common-animations/pulse';
import { repeat } from './common-animations/helpers/repeat';
import { parseSaneColorParam } from '../utils/colors/parse-sane-color-param';
import { morph } from './common-animations/morph';
import { morphMany } from './common-animations/morph-many';

export abstract class Animation {
  static pulse(
    color: SaneColorParam,
    steps: number,
    totalDuration: number,
    repeatCount: number = 1,
  ) {
    const actualColorTuple = parseSaneColorParam(color);
    const pulseIterator = pulse(actualColorTuple, { steps, totalDuration });
    if (repeatCount === 1) {
      return pulseIterator;
    }
    return repeat(pulseIterator, repeatCount);
  }

  static morph(
    from: SaneColorParam,
    to: SaneColorParam,
    overMs: number,
    steps: number = 100,
  ): AnimationDescription {
    const baseRgb = parseSaneColorParam(from);
    const targetRgb = parseSaneColorParam(to);
    return morph(baseRgb, targetRgb, overMs, steps);
  }

  static morphMany(tuples: SaneColorParam[], overMs: number, steps = tuples.length * 50) {
    return morphMany(tuples.map(parseSaneColorParam), overMs, steps);
  }
}

export type AnimationDescription =
  | Iterable<SimpleFrame | ComplexFrame>
  | AsyncIterable<SimpleFrame | ComplexFrame>;
