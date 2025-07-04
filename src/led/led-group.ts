import { BlinkstickAny } from '../core/blinkstick';
import { ColorInput } from '../types';
import { colorInputToRgbTuple } from '../utils/colors/color-input-to-rgb-tuple';
import { Buffer } from 'node:buffer';

function prepareBuffer(buffer: Buffer, red: number, green: number, blue: number) {
  for (let i = 0; i < buffer.length; i = (i + 3) | 0) {
    buffer.writeUInt8(green & 0xff, i); // G
    buffer.writeUInt8(red & 0xff, i + 1); // R
    buffer.writeUInt8(blue & 0xff, i + 2); // B
  }
}

/**
 * Class to control a group of LEDs on a Blinkstick device.
 * Currently, it supports only "all LEDs" mode, but it can be extended to support more complex patterns.
 * @category Implementation details
 */
export class LedGroup {
  protected readonly buffer: Buffer;

  constructor(public readonly blinkstick: BlinkstickAny) {
    this.blinkstick = blinkstick;
    this.buffer = Buffer.alloc(blinkstick.ledCount * 3);
  }

  /**
   * Sets the color of all LEDs
   * @param color
   */
  public async setColor(color: ColorInput) {
    const [r, g, b] = colorInputToRgbTuple(color);
    prepareBuffer(this.buffer, r, g, b);
    return await this.blinkstick.setColors(0, this.buffer);
  }

  /**
   * @deprecated
   */
  public async setColorAndForget(color: ColorInput) {
    const [r, g, b] = colorInputToRgbTuple(color);
    prepareBuffer(this.buffer, r, g, b);
    return await this.blinkstick.setColors(0, this.buffer);
  }

  /**
   * Turns off all LEDs by setting their color to black (0, 0, 0).
   */
  public async turnOff() {
    return await this.setColor([0, 0, 0]);
  }
}
