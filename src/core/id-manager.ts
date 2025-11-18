import { type BlinkStick } from './blinkstick';
import { FeatureReportDescription } from '../types';
import { Console } from 'node:console';

const header = Buffer.from(`BLINK_ID`, 'ascii');
const identifierLength = Buffer.from(crypto.randomUUID().replaceAll('-', ''), 'hex').length;

/**
 * @summary Class to manage IDs on BlinkStick devices.
 * @remarks OK, let's not complicate it.
 * We just take over infoBlock2
 * @category Core
 */
export class DeviceIdManager {
  public constructor(private readonly blinkstick: BlinkStick) {}

  /**
   * @summary Sets the device identifier.
   * @remarks The identifier must be a Buffer of length 16 bytes.
   * Prints the new identifier to stderr.
   * @param id
   */
  async setId(id: Buffer) {
    if (id.length !== identifierLength) {
      throw new Error(`Identifier length must be ${identifierLength} bytes`);
    }
    const featureReport = FeatureReportDescription.InfoBlock2;
    const data = Buffer.alloc(featureReport.bufferLength + 1, 0);
    data[0] = featureReport.reportId;
    header.copy(data, 1);
    id.copy(data, header.length);
    await this.blinkstick.setInfoBlock2(data);

    const idString = id.toString('hex');

    new Console(process.stderr, process.stderr).info(
      `Your device has been assigned a new identifier: ${idString}`,
      this.blinkstick.deviceDescription,
    );

    return id.toString('hex');
  }

  /**
   * @summary Gets the device identifier, creating a new one if none is set.
   */
  async getOrCreateId() {
    const existingId = await this.getId();
    if (existingId) {
      return existingId;
    }
    return this.generateNewIdInfoBlock();
  }

  /**
   * @summary Gets the device identifier or null.
   * @remarks Returns null if no identifier is set.
   */
  public async getId(): Promise<string | null> {
    const infoBlock2 = await this.blinkstick.getInfoBlock2();
    if (infoBlock2.subarray(0, header.length).equals(header)) {
      const id = infoBlock2.subarray(header.length, header.length + identifierLength);
      return id.toString('hex');
    }
    return null;
  }

  private generateNewIdInfoBlock() {
    const id = Buffer.from(crypto.randomUUID().replaceAll('-', ''), 'hex');
    return this.setId(id);
  }
}
