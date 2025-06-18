import { asBuffer } from '../utils/as-buffer';
import { MinimalDeviceInfo, UsbTransport } from './usb-transport';
import { HID } from 'node-hid';

export class NodeHidSyncTransport extends UsbTransport {
  constructor(private readonly device: HID) {
    super();
  }

  async sendFeatureReport(data: Buffer | number[]): Promise<number> {
    return this.device.sendFeatureReport(this.sanitizeInput(data));
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
