import { RgbTuple } from '../types/rgb-tuple';

/**
 * Converts an array of RGB tuples to a buffer for bulk setting.
 * @param tuples
 * @param buffer
 */
export function convertArrayOfRgbTuplesToBulkSetBuffer(tuples: RgbTuple[], buffer: Buffer) {
  // We need to set LED data in the following format: [g0, r0, b0, g1, r1, b1...]

  for (const [index, tuple] of tuples.entries()) {
    const offset = index * 3;
    buffer.writeUInt8(tuple[1], offset); // R
    buffer.writeUInt8(tuple[0], offset + 1); // G
    buffer.writeUInt8(tuple[2], offset + 2); // B
  }

  return buffer;
}
