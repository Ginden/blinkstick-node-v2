import { SimpleFrame } from './frame/simple-frame';
import { FrameIterable } from './animation-description';
import { Frame } from './frame/frame';
import { ColorInput } from '../types';
import { colorInputToRgbTuple } from '../utils';
import { pulse } from './common/pulse';
import { combine } from './helpers/combine';
import { WaitFrame } from './frame/wait-frame';
import { types } from 'node:util';
import { wrapGeneratorForAnimation } from './helpers/wrap-generator-function-in-object';
import { morphComplex } from './common/morph-complex';
import { assertFpsBelow100 } from './helpers/assert-fps-below-100';
import { repeat } from './helpers/repeat';
import { transformEachFrame, TransformEachFrameCb } from './helpers/transform-each-frame';
import { assert } from 'tsafe';

/**
 * Our primary class for building complex animations.
 * You SHOULD use static methods to create an instance of this class,
 * but you are an adult. You can extend this class and use it as you want.
 * @category Animation
 */
export class AnimationBuilder {
  protected subAnimations: FrameIterable[] = [];

  static startWithBlack(ms: number): AnimationBuilder {
    const builder = new AnimationBuilder();
    return builder.addStaticFrame(new SimpleFrame([0, 0, 0], ms));
  }

  static startWithColor(color: ColorInput, ms: number): AnimationBuilder {
    const builder = new AnimationBuilder();
    return builder.addStaticFrame(new SimpleFrame(colorInputToRgbTuple(color), ms));
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

  /**
   * Forks the current animation builder, allowing to create a new animation
   * that is a copy of the current one.
   * If any of the animations are generators, an error will be thrown.
   */
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
    return this.addStaticFrame(new SimpleFrame(colorInputToRgbTuple(color), ms));
  }

  public addStaticFrame(simpleFrame: Frame) {
    this.subAnimations.push([simpleFrame]);
    return this;
  }

  public addPulse(color: ColorInput, overMs: number, steps = overMs / 60) {
    assertFpsBelow100(overMs, steps);
    this.subAnimations.push(pulse(colorInputToRgbTuple(color), { steps, overMs }));
    return this;
  }

  /**
   * Appends a new animation to the current one.
   * @param animation
   */
  public append(animation: FrameIterable) {
    this.subAnimations.push(animation);
    return this;
  }

  /**
   * Appends a new animation to the current one, but provides smooth transition between last frame of the current animation
   * and first frame of the new one.
   */
  smoothTransitionToAnimation(animation: FrameIterable, ms: number, steps = ms / 60) {
    this.assertNoGenerators();
    this.subAnimations = [morphComplex(combine(...this.subAnimations), animation, ms, steps)];
    return this;
  }

  /**
   * Morphs the current animation to the given color.
   * @param color
   * @param ms
   */
  morphToColor(color: ColorInput, ms: number) {
    this.assertNoGenerators();
    this.subAnimations = [
      morphComplex(
        combine(...this.subAnimations),
        [SimpleFrame.colorAndDuration(colorInputToRgbTuple(color), ms)],
        ms,
      ),
    ];
    return this;
  }

  /**
   * Waits for the given time, retaining current color and state.
   * @param ms
   */
  public wait(ms: number) {
    this.subAnimations.push([new WaitFrame(ms)]);
  }

  /**
   * Repeats the current animation the given number of times.
   * @param times
   */
  repeat(times: number) {
    this.assertNoGenerators();
    this.subAnimations = [repeat(combine(...this.subAnimations), times)];
    return this;
  }

  transformEachFrame(transform: TransformEachFrameCb) {
    this.assertNoGenerators();
    this.subAnimations = [transformEachFrame(combine(...this.subAnimations), transform)];
    return this;
  }

  build() {
    assert(this.subAnimations.length > 0, 'No animations to build');
    return combine(...this.subAnimations);
  }
}
