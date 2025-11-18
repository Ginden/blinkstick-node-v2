import { BlinkstickAny } from '../core/blinkstick';
import { RgbTuple } from '../types';

/**
 * Class to control a single LED on a Blinkstick device.
 * @category Implementation details
 */
export class Led {
  /**
   * Reference to the Blinkstick device that this LED belongs to.
   */
  public readonly blinkstick: BlinkstickAny;
  /**
   * Index of the LED on the Blinkstick device.
   */
  public readonly index: number;

  constructor(blinkstick: BlinkstickAny, index: number) {
    this.blinkstick = blinkstick;
    this.index = index;
  }

  setColor(red: number, green: number, blue: number) {
    return this.blinkstick.setColor(red, green, blue, { index: this.index });
  }

  /**
   * Returns RGB tuple representing the current color of the LED.
   */
  getColor(): Promise<RgbTuple> {
    return this.blinkstick.getColor(this.index);
  }

  /**
   * Turns of the LED by setting its color to black (0, 0, 0).
   */
  turnOff() {
    return this.setColor(0, 0, 0);
  }
}
