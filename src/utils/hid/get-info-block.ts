import { BlinkStick } from '../../core/blinkstick';

export async function getInfoBlockRaw(device: BlinkStick, location: number): Promise<Buffer> {
  const buffer = await device.getFeatureReport(location, 33);
  return Buffer.from(buffer, 1);
}
