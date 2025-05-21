import { BlinkstickAny } from '../blinkstick';
import { AnimationDescription } from './animation-description';
import { assert } from 'tsafe';
import { combine } from './common-animations/helpers/combine';
import { SimpleFrame } from './simple-frame';
import { ComplexFrame } from './complex-frame';
import { scheduler } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
import { Frame } from './frame';
import { convertArrayOfRgbTuplesToBulkSetBuffer } from '../utils/convert-array-of-rgb-tuples-to-bulk-set-buffer';

const abortError = new Error('Animation aborted');

export class AnimationRunner {
  private abortController = new AbortController();
  private ledGroup;
  private leds;
  private buffer;
  private isRunning = false;

  constructor(public readonly blinkstick: BlinkstickAny) {
    this.ledGroup = blinkstick.leds();
    this.leds = Array.from({ length: blinkstick.describeDevice()!.ledCount }, (_, index) =>
      this.blinkstick.led(index),
    );
    this.buffer = Buffer.alloc(this.leds.length * 3);
  }

  /**
   * Stops the animation
   */
  stop() {
    this.abortController.abort(abortError);
    this.abortController = new AbortController();
    this.isRunning = false;
  }

  async run(...animations: AnimationDescription[]) {
    if (this.isRunning) {
      throw new Error('Animation is already running');
    }
    return this.runNew(...animations);
  }

  runAndForget(animations: AnimationDescription[], cb?: (err: Error | null) => unknown) {
    this.runNew(...animations).catch((err) => {
      if (err === abortError) {
        return;
      } else {
        cb?.(err);
      }
    });
  }

  async runNew(...animations: AnimationDescription[]) {
    this.isRunning = true;
    const currentAnimation = combine(...animations);
    const { signal } = this.abortController;
    try {
      for await (const frame of currentAnimation) {
        await this.applyFrame(frame, signal);
      }
    } catch (err) {
      if (err === abortError) {
        return;
      } else {
        throw err;
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async applySimpleFrame(frame: SimpleFrame) {
    await this.ledGroup.setColorAndForget(frame.rgb);
  }

  private async applyComplexFrame(frame: ComplexFrame) {
    assert(this.leds.length === frame.colors.length, 'Frame and LEDs length mismatch');
    await this.blinkstick.setColorsAndForget(
      0,
      convertArrayOfRgbTuplesToBulkSetBuffer(frame.colors, this.buffer),
    );
  }

  private async applyFrame(frame: Frame, signal: AbortSignal) {
    signal.throwIfAborted();
    const { duration } = frame;
    const t0 = performance.now();
    if (frame instanceof SimpleFrame) {
      await this.applySimpleFrame(frame);
    } else {
      await this.applyComplexFrame(frame);
    }
    const timeElapsed = performance.now() - t0;
    signal.throwIfAborted();
    await scheduler.wait(Math.max(duration - timeElapsed, 0));
    signal.throwIfAborted();
  }
}
