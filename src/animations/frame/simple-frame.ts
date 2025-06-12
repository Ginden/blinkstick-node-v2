import { RgbTuple } from '../../types/rgb-tuple';
import { ConditionalPick, JsonValue } from 'type-fest';
import { ColorInput } from '../../types';
import { colorInputToRgbTuple } from '../../utils';

/**
 * SimpleFrame represents a single frame of animation with a specific color and duration.
 * @category Animation
 */
export class SimpleFrame {
  readonly duration: number;
  readonly rgb: RgbTuple;

  static fromProperties(props: ConditionalPick<SimpleFrame, JsonValue>) {
    return new SimpleFrame(props.rgb, props.duration | 0);
  }

  static colorAndDuration(color: ColorInput, duration: number): SimpleFrame {
    return new SimpleFrame(colorInputToRgbTuple(color), duration | 0);
  }

  constructor(rgb: RgbTuple, duration: number) {
    this.rgb = rgb;
    this.duration = duration | 0;
  }

  toString(): string {
    return `SimpleFrame([${this.rgb.join(', ')}], ${this.duration})`;
  }
}
