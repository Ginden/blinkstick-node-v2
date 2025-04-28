/**
 * Generate a random integer number within a range.
 *
 * @private
 * @static
 * @method randomIntInclusive
 * @param {Number} low the low value of the number
 * @param {Number} high the high value of the number
 * @return {Number} Random number in the range of [low..high] inclusive of low and high
 */
export function randomIntInclusive(low: number, high: number): number {
  return Math.floor(Math.random() * (high - low + 1) + low);
}
