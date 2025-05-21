import { HID, HIDAsync } from 'node-hid';

/**
 * Wrapper class to keep BlinkStick class a bit cleaner.
 */
export class DevicePrimitives<HidDevice extends HID | HIDAsync> {
  constructor(public readonly device: HidDevice) {}
}
