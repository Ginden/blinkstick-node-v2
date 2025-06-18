import { Buffer } from 'node:buffer';

/**
 * Coerce a number array, Buffer, or Uint8Array to a Buffer.
 * Already existing Buffers are returned as-is.
 * Uint8Arrays are converted to Buffers without copying.
 * @param data
 */
export function asBuffer(data: number[] | Buffer | Uint8Array): Buffer {
  if (Array.isArray(data)) {
    return Buffer.from(data);
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }

  return Buffer.from(data.buffer);
}
