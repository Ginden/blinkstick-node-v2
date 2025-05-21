import { BlinkstickAny } from '../core/blinkstick';
import { RgbTuple } from '../types';

export class Led {
  constructor(
    public readonly blinkstick: BlinkstickAny,
    public readonly index: number,
  ) {}

  setColor(red: number, green: number, blue: number) {
    return this.blinkstick.setColor(red, green, blue, { index: this.index });
  }

  getColor(): Promise<RgbTuple> {
    return this.blinkstick.getColor(this.index);
  }
}
