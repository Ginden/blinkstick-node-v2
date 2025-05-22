import { SimpleFrame } from './simple-frame';
import { FrameIterable } from './animation-description';
import { Frame } from './frame';
import { ColorInput } from '../types';
import { parseSaneColorParam } from '../utils';
import { pulse } from './common/pulse';
import { combine } from './helpers/combine';
import { NullFrame } from './null-frame';
import { types } from 'node:util';
import { wrapGeneratorForAnimation } from './helpers/wrap-generator-function-in-object';
import { morphComplex } from './common/morph-complex';
import { assertFpsBelow100 } from './helpers/assert-fps-below-100';

export class AnimationBuilder {
  protected subAnimations: FrameIterable[] = [];

  static startWithBlack(ms: number): AnimationBuilder {
    const builder = new AnimationBuilder();
    return builder.addStaticFrame(new SimpleFrame([0, 0, 0], ms));
  }

  protected assertNoGenerators() {
    for (const [i, animation] of this.subAnimations.entries()) {
      if (types.isGeneratorObject(animation)) {
        throw new Error(
          `This operation is not supported, because animation ${i} is a generator. Wrap generator function through ${wrapGeneratorForAnimation.name} function`,
        );
      }
    }
  }

  public fork() {
    this.assertNoGenerators();
    const builder = new AnimationBuilder();
    builder.subAnimations = [...this.subAnimations];
    return builder;
  }

  /*
   * Adds a static frame to the animation.
   */
  public stillColor(color: ColorInput, ms: number) {
    return this.addStaticFrame(new SimpleFrame(parseSaneColorParam(color), ms));
  }

  public addStaticFrame(simpleFrame: Frame) {
    this.subAnimations.push([simpleFrame]);
    return this;
  }

  public addPulse(color: ColorInput, overMs: number, steps = overMs / 60) {
    assertFpsBelow100(overMs, steps);
    this.subAnimations.push(pulse(parseSaneColorParam(color), { steps, overMs }));
    return this;
  }

  public append(animation: FrameIterable) {
    this.subAnimations.push(animation);
    return this;
  }

  public wait(ms: number) {
    this.subAnimations.push([new NullFrame(ms)]);
  }

  morphToColor(color: ColorInput, ms: number) {
    this.subAnimations = [
      morphComplex(
        combine(...this.subAnimations),
        [SimpleFrame.colorAndDuration(parseSaneColorParam(color), ms)],
        ms,
      ),
    ];
    return this;
  }

  smoothTransitionToAnimation(animation: FrameIterable, ms: number, steps = ms / 60) {
    this.subAnimations = [morphComplex(combine(...this.subAnimations), animation, ms, steps)];
    return this;
  }

  build() {
    return combine(...this.subAnimations);
  }
}
