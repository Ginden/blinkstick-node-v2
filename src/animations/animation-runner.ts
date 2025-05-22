import { BlinkstickAny } from '../core/blinkstick';
import { FrameIterable } from './animation-description';
import { assert } from 'tsafe';
import { combine } from './helpers/combine';
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
  public ledCount;
  protected buffer;
  protected isRunning = false;

  constructor(public readonly blinkstick: BlinkstickAny) {
    this.ledGroup = blinkstick.leds();
    this.leds = Array.from({ length: blinkstick.ledCount }, (_, index) =>
      this.blinkstick.led(index),
    );
    this.buffer = Buffer.alloc(this.leds.length * 3);
    this.ledCount = this.leds.length;
  }

  /**
   * Stops the animation
   */
  stop() {
    this.abortController.abort(abortError);
    this.abortController = new AbortController();
    this.isRunning = false;
  }

  /**
   * Runs the animation
   * If the animation is already running, it will throw an error
   *
   * Will wait for the animation to finish before returning
   * @param animations
   */
  async run(...animations: FrameIterable[]) {
    if (this.isRunning) {
      throw new Error('Animation is already running');
    }
    return this.runNew(...animations);
  }

  /**
   * Will replace the current animation and run the new one
   * Optional callback will be called when the animation is finished
   */
  runAndForget(animations: FrameIterable[], cb?: (err: Error | null) => unknown) {
    void this.runNew(...animations).catch((err) => {
      if (err === abortError) {
        cb?.(null);
        return;
      } else {
        cb?.(err);
      }
    });
  }

  /**
   * Runs the animation, replacing the current one
   * If the animation is already running, it will be stopped
   * @param animations
   */
  async runNew(...animations: FrameIterable[]) {
    this.isRunning = true;
    this.abortController.abort(abortError);
    this.abortController = new AbortController();
    const currentAnimation = combine(...animations);
    const { signal } = this.abortController;
    let sumFrameDuration = 0;
    let sumTimeElapsed = 0;
    try {
      for await (const frame of currentAnimation) {
        const t0 = performance.now();
        await this.applyFrame(frame, signal);
        const timeElapsed = performance.now() - t0;
        const frameDuration = frame.duration;
        sumFrameDuration += frameDuration;
        sumTimeElapsed += timeElapsed;
      }
    } catch (err) {
      if (err === abortError) {
        return;
      } else {
        throw err;
      }
    } finally {
      this.isRunning = false;
      console.log(
        `Animation finished. Expected: ${sumFrameDuration | 0}ms, Actual: ${sumTimeElapsed | 0}ms`,
      );
    }
  }

  protected async applySimpleFrame(frame: SimpleFrame) {
    await this.ledGroup.setColorAndForget(frame.rgb);
  }

  protected async applyComplexFrame(frame: ComplexFrame) {
    assert(this.leds.length === frame.colors.length, 'Frame and LEDs length mismatch');
    await this.blinkstick.setColors(
      0,
      convertArrayOfRgbTuplesToBulkSetBuffer(frame.colors, this.buffer),
    );
  }

  protected async applyFrame(frame: Frame, signal: AbortSignal) {
    signal.throwIfAborted();
    const { duration } = frame;
    const t0 = performance.now();
    if (frame instanceof SimpleFrame) {
      await this.applySimpleFrame(frame);
    } else if (frame instanceof ComplexFrame) {
      await this.applyComplexFrame(frame);
    }
    const timeElapsed = performance.now() - t0;
    const waitTime = Math.max(Math.round(duration - timeElapsed), 0);
    if (waitTime > 0) await scheduler.wait(waitTime, { signal });
  }
}
