import type { Buffer } from 'node:buffer';

/**
 * @category Adapters
 */
export type MinimalDeviceInfo = {
  product?: string | undefined;
  serialNumber?: string;
  vendorId: number;
  productId: number;
  manufacturer?: string;
  release: number;
};

/**
 * @category Adapters
 */
export abstract class UsbTransport {
  abstract sendFeatureReport(data: Buffer): Promise<number>;
  abstract getFeatureReport(reportId: number, reportLength: number): Promise<Buffer>;
  abstract getDeviceInfo(): MinimalDeviceInfo;
  abstract close(): Promise<unknown>;
}
