import { MinimalDeviceInfo, UsbTransport } from './usb-transport';
import type { Device, HIDAsync } from 'node-hid';

export class NodeHidAsyncTransport extends UsbTransport {
  protected deviceInfo!: Device;

  protected constructor(protected readonly device: HIDAsync) {
    super();
  }

  static async create(device: HIDAsync): Promise<NodeHidAsyncTransport> {
    const transport = new NodeHidAsyncTransport(device);
    transport.deviceInfo = await device.getDeviceInfo();

    return transport;
  }

  static createWithKnownInfo(device: HIDAsync, info: Device): NodeHidAsyncTransport {
    const transport = new NodeHidAsyncTransport(device);
    transport.deviceInfo = info;

    return transport;
  }

  sendFeatureReport(data: Buffer): Promise<number> {
    return this.device.sendFeatureReport(data);
  }
  getFeatureReport(reportId: number, reportLength: number): Promise<Buffer> {
    return this.device.getFeatureReport(reportId, reportLength);
  }
  getDeviceInfo(): MinimalDeviceInfo {
    return this.deviceInfo;
  }
  close(): Promise<unknown> {
    return this.device.close();
  }
}
