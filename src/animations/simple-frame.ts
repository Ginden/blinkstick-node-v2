import { RgbTuple } from '../types/rgb-tuple';
import { ConditionalPick, JsonValue } from 'type-fest';

/**
 * SimpleFrame represents a single frame of animation with a specific color and duration.
 */
export class SimpleFrame {
  readonly duration: number;
  readonly rgb: RgbTuple;

  static fromProperties(props: ConditionalPick<SimpleFrame, JsonValue>) {
    return new SimpleFrame(props.rgb, props.duration);
  }

  constructor(rgb: RgbTuple, duration: number) {
    this.rgb = rgb;
    this.duration = duration;
  }
}
