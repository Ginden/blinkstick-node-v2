import { BlinkStick } from './blinkstick';
import { HID } from 'node-hid';
import { NodeHidSyncTransport } from '../transport';

/**
 * Synchronous version of BlinkStick class.
 * @category Core
 */
export class BlinkstickSync extends BlinkStick<NodeHidSyncTransport> {
  public readonly isSync = true;

  constructor(device: HID) {
    super(new NodeHidSyncTransport(device));
  }
}
