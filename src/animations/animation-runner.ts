import { BlinkstickAny } from '../core/blinkstick';
import { FrameIterable } from './animation-description';
import { assert } from 'tsafe';
import { combine } from './helpers/combine';
import { SimpleFrame } from './frame/simple-frame';
import { ComplexFrame } from './frame/complex-frame';
import { scheduler } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
import { Frame } from './frame/frame';
import { convertArrayOfRgbTuplesToBulkSetBuffer } from '../utils/convert-array-of-rgb-tuples-to-bulk-set-buffer';
import { WaitFrame } from './frame/wait-frame';

const abortError = new Error('Animation aborted');

let warningEverEmitted = false;

/**
 * This class is responsible for running animations on a Blinkstick device.
 * It handles the animation loop, applying frames to the device, and managing
 * the animation state.
 *
 * It's bound to a single Blinkstick device and can only run one animation at a time.
 * @category Animation
 */
export class AnimationRunner {
  protected abortController = new AbortController();
  protected ledGroup;
  protected leds;
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
   * Stops current animation
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
  async run(animations: FrameIterable[], { signal }: { signal?: AbortSignal } = {}) {
    assert(animations.length > 0, 'At least one animation must be provided');
    if (this.isRunning) {
      throw new Error('Animation is already running');
    }
    return this.runNew(animations, { signal });
  }

  /**
   * Will replace the current animation and run the new one
   * Optional callback will be called when the animation is finished
   */
  runAndForget(
    animations: FrameIterable[],
    cb?: (err: Error | null) => unknown,
    { signal }: { signal?: AbortSignal } = {},
  ) {
    void this.runNew(animations, { signal }).catch((err) => {
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
   *
   * If the animation is already running, it will be stopped
   *
   * You can pass an optional AbortSignal to cancel the animation at any time
   */
  async runNew(animations: FrameIterable[], { signal: userSignal }: { signal?: AbortSignal } = {}) {
    this.isRunning = true;
    this.abortController.abort(abortError);
    this.abortController = new AbortController();
    const currentAnimation = combine(...animations);
    const signal = AbortSignal.any(
      [this.abortController.signal, userSignal].filter((s): s is AbortSignal => s !== undefined),
    );
    let sumFrameDuration = 0;
    let sumTimeElapsed = 0;
    try {
      for await (const frame of currentAnimation) {
        const t0 = performance.now();
        await this.applyFrame(frame, signal);
        const timeElapsed = performance.now() - t0;
        const frameDuration = frame.duration;
        if (frameDuration < 16 && !(frame instanceof WaitFrame)) {
          this.emitWarningForShortFrameDuration(frame);
        }
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

  /**
   * Applies a frame to the device and waits for the duration of the frame.
   * @protected
   */
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

  private emitWarningForShortFrameDuration(frame: Frame) {
    if (warningEverEmitted) return;
    warningEverEmitted = true;
    process.emitWarning(
      `Frame ${frame.constructor.name} duration is too short. It may cause flickering.`,
      {
        code: 'AnimationFrameDurationTooShort',
        detail: `Frame duration should be at least 16ms to avoid flickering. Current duration: ${frame.duration}ms`,
      },
    );
  }
}
