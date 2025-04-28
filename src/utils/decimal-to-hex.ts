/**
 * Converts decimal number to hex with zero padding
 *
 * @private
 * @method decimalToHex
 * @param {Number} d Decimal number to convert
 * @param {Number} padding How many zeros to use for padding
 * @return {String} Decimal number converted to hex string
 */
export function decimalToHex(d: number, padding: number): string {
  let hex = Number(d).toString(16);
  padding = typeof padding === 'undefined' || padding === null ? 2 : padding;

  while (hex.length < padding) {
    hex = '0' + hex;
  }

  return hex;
}
