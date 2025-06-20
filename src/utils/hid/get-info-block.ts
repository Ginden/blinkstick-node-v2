import { BlinkstickAny } from '../../core/blinkstick';

export async function getInfoBlockRaw(device: BlinkstickAny, location: number): Promise<Buffer> {
  const buffer = await device.getFeatureReport(location, 33);
  return Buffer.from(buffer, 1);
}
