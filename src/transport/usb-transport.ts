import { asBuffer } from '../utils';

export type MinimalDeviceInfo = {
  product?: string | undefined;
  serialNumber?: string;
  vendorId: number;
  productId: number;
  manufacturer?: string;
  release: number;
};

export abstract class UsbTransport {
  abstract sendFeatureReport(data: Buffer | number[]): Promise<number>;
  abstract getFeatureReport(reportId: number, reportLength: number): Promise<Buffer>;
  abstract getDeviceInfo(): MinimalDeviceInfo;
  abstract close(): Promise<unknown>;

  protected sanitizeInput(data: Buffer | number[]): Buffer {
    return asBuffer(data);
  }
}
