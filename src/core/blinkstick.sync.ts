import { BlinkStick } from './blinkstick';
import { HID } from 'node-hid';

export class BlinkstickSync extends BlinkStick<HID> {
  public readonly isSync = true;

  constructor(device: HID) {
    super(device, device.getDeviceInfo());
  }
}
