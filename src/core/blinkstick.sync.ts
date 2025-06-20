import { BlinkStick } from './blinkstick';
import { HID } from 'node-hid';
import { NodeHidSyncTransport } from '../transport';
import { LimitedBlinkStick } from './schedulable-operations';

/**
 * Synchronous version of BlinkStick class.
 * @category Core
 */
export class BlinkstickSync extends BlinkStick<NodeHidSyncTransport> {
  public readonly isSync = true;

  protected scheduledOperations: ((device: LimitedBlinkStick<BlinkstickSync>) => unknown)[] = [];

  constructor(device: HID) {
    super(new NodeHidSyncTransport(device));
  }

  /**
   * Schedules an operation to be executed later.
   *
   * @param fn
   */
  public schedule(fn: (device: LimitedBlinkStick<BlinkstickSync>) => unknown): this {
    this.scheduledOperations.push(fn);
    return this;
  }

  private async runScheduledOperations() {
    if (this.scheduledOperations.length === 0) {
      return;
    }
    do {
      const operation = this.scheduledOperations.shift();
      if (operation) {
        await operation(this);
      }
    } while (this.scheduledOperations.length > 0);
  }

  /**
   * @ignore
   */
  async setColor(...args: Parameters<BlinkStick['setColor']>) {
    await this.runScheduledOperations();
    return super.setColor(...args);
  }

  /**
   * @ignore
   */
  async getColor(...args: Parameters<BlinkStick['getColor']>) {
    await this.runScheduledOperations();
    return super.getColor(...args);
  }

  /**
   * @ignore
   */
  async getColors(...args: Parameters<BlinkStick['getColors']>) {
    await this.runScheduledOperations();

    return super.getColors(...args);
  }

  /**
   * @ignore
   */
  async setColors(...args: Parameters<BlinkStick['setColors']>) {
    await this.runScheduledOperations();
    return super.setColors(...args);
  }
}
