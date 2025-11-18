import { BlinkStick } from '../blinkstick';
import type { Device, HIDAsync } from 'node-hid';
import { NodeHidAsyncTransport } from '../../transport/node-hid-async-transport';

/**
 * @summary Async and recommended version of BlinkStick class using `node-hid` for communication.
 * @category Implementation details
 */
export class BlinkstickAsync extends BlinkStick<NodeHidAsyncTransport> {
  public readonly isSync = false;
  constructor(device: HIDAsync, info: Device) {
    super(NodeHidAsyncTransport.createWithKnownInfo(device, info));
  }
}
