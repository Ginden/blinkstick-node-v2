/**
 * Null frame doesn't change the state of the LEDs. It just waits.
 */
export class NullFrame {
  public readonly duration: number;
  constructor(duration: number) {
    this.duration = duration;
  }
}
