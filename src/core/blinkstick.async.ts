import { BlinkStick } from './blinkstick';
import { Device, HIDAsync } from 'node-hid';

/**
 * Async version of BlinkStick class.
 * @category Core
 */
export class BlinkstickAsync extends BlinkStick<HIDAsync> {
  public readonly isSync = false;
  constructor(device: HIDAsync, info: Device) {
    super(device, info);
  }
}
