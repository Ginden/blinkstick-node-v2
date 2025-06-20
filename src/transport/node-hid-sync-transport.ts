import { asBuffer } from '../utils/as-buffer';
import { MinimalDeviceInfo, UsbTransport } from './usb-transport';
import { HID } from 'node-hid';
import { Buffer } from 'node:buffer';

export class NodeHidSyncTransport extends UsbTransport {
  constructor(protected readonly device: HID) {
    super();
  }

  async sendFeatureReport(data: Buffer): Promise<number> {
    return this.device.sendFeatureReport(data);
  }
  async getFeatureReport(reportId: number, reportLength: number): Promise<Buffer> {
    const report = this.device.getFeatureReport(reportId, reportLength);
    return asBuffer(report);
  }
  getDeviceInfo(): MinimalDeviceInfo {
    return this.device.getDeviceInfo();
  }
  async close(): Promise<unknown> {
    return this.device.close();
  }
}
