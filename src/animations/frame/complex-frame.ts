import { RgbTuple } from '../../types/rgb-tuple';
import { SimpleFrame } from './simple-frame';

/**
 * Complex frame represents a single frame of animation with multiple colors and a specific duration.
 */
export class ComplexFrame {
  duration: number;
  /**
   * An array of RGB tuples representing the colors to be displayed.
   * The length of the array should be equal to the number of LEDs.
   */
  colors: RgbTuple[];

  constructor(colors: RgbTuple[], duration: number) {
    this.colors = colors;
    this.duration = duration | 0;
  }

  static fromSimpleFrame(frame: SimpleFrame, ledCount: number) {
    const { rgb, duration } = frame;
    const rgbCopy = [...rgb] as RgbTuple;
    const colors = Array.from({ length: ledCount }, () => rgbCopy);
    return new ComplexFrame(colors, duration | 0);
  }
}
