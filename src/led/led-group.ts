import { BlinkstickAny } from '../blinkstick';
import { SaneColorParam } from '../types';
import { parseSaneColorParam } from '../utils/colors/parse-sane-color-param';

function prepareBuffer(buffer: Uint8Array, red: number, green: number, blue: number) {
  for (let i = 0; i < buffer.length; i = (i + 3) | 0) {
    buffer[i] = green;
    buffer[i + 1] = red;
    buffer[i + 2] = blue;
  }
}

export class LedGroup {
  private readonly buffer: Buffer;
  constructor(
    public readonly blinkstick: BlinkstickAny,
    public readonly ledCount: number,
  ) {
    this.blinkstick = blinkstick;
    this.ledCount = ledCount;
    this.buffer = Buffer.alloc(ledCount * 3);
  }

  public setColor(color: SaneColorParam) {
    const [r, g, b] = parseSaneColorParam(color);
    prepareBuffer(this.buffer, r, g, b);
    return this.blinkstick.setColors(0, this.buffer);
  }

  public setColorAndForget(color: SaneColorParam) {
    const [r, g, b] = parseSaneColorParam(color);
    prepareBuffer(this.buffer, r, g, b);
    return this.blinkstick.setColorsAndForget(0, this.buffer);
  }
}
