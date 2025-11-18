import { BlinkStick } from '../blinkstick';
import type { Device, HIDAsync } from 'node-hid';
import { NodeHidAsyncTransport } from '../../transport/node-hid-async-transport';

/**
 * @summary Async and recommended version of BlinkStick class.
 * @category Core
 */
export class BlinkstickAsync extends BlinkStick<NodeHidAsyncTransport> {
  public readonly isSync = false;
  constructor(device: HIDAsync, info: Device) {
    super(NodeHidAsyncTransport.createWithKnownInfo(device, info));
  }
}
