import { BlinkstickAny } from '../core/blinkstick';
import { RgbTuple } from '../types';

/**
 * Class to control a single LED on a Blinkstick device.
 * @category Implementation details
 */
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

  turnOff() {
    return this.setColor(0, 0, 0);
  }
}
