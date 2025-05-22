import { SimpleFrame } from './simple-frame';
import { AnimationDescription } from './animation-description';
import { Frame } from './frame';
import { SaneColorParam } from '../types';
import { parseSaneColorParam } from '../utils';
import { pulse } from './common/pulse';
import { combine } from './helpers/combine';
import { NullFrame } from './null-frame';

export class AnimationBuilder {
  protected subAnimations: AnimationDescription[] = [];

  static startWithBlack(ms: number): AnimationBuilder {
    const builder = new AnimationBuilder();
    return builder.addStaticFrame(new SimpleFrame([0, 0, 0], ms));
  }

  public fork() {
    const builder = new AnimationBuilder();
    builder.subAnimations = [...this.subAnimations];
    return builder;
  }

  /*
   * Adds a static frame to the animation.
   */
  public stillColor(color: SaneColorParam, ms: number) {
    return this.addStaticFrame(new SimpleFrame(parseSaneColorParam(color), ms));
  }

  public addStaticFrame(simpleFrame: Frame) {
    this.subAnimations.push([simpleFrame]);
    return this;
  }

  public addPulse(color: SaneColorParam, ms: number, steps = 100) {
    this.subAnimations.push(pulse(parseSaneColorParam(color), { steps, totalDuration: ms }));
    return this;
  }

  public append(animation: AnimationDescription) {
    this.subAnimations.push(animation);
    return this;
  }

  public wait(ms: number) {
    this.subAnimations.push([new NullFrame(ms)]);
  }

  build() {
    return combine(...this.subAnimations);
  }
}
