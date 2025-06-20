import type { RgbTuple } from '../types/rgb-tuple';
import type { Buffer } from 'node:buffer';

/**
 * Converts an array of RGB tuples to a buffer for bulk setting.
 * @param tuples
 * @param buffer
 */
export function convertArrayOfRgbTuplesToBulkSetBuffer(tuples: RgbTuple[], buffer: Buffer) {
  // We need to set LED data in the following format: [g0, r0, b0, g1, r1, b1...]

  for (const [index, tuple] of tuples.entries()) {
    const offset = index * 3;
    const [r, g, b] = tuple;
    // We need to write GRB format
    buffer.writeUInt8(g, offset);
    buffer.writeUInt8(r, offset + 1);
    buffer.writeUInt8(b, offset + 2);
  }

  return buffer;
}
