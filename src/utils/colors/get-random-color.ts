import { ColorObject, RgbTuple } from '../../types';
import { randomIntInclusive } from '../random-int-inclusive';

/**
 * @summary Gets a random RGB color object.
 * @category Utils
 */
export function getRandomColor(): ColorObject {
  return {
    r: randomIntInclusive(0, 255),
    g: randomIntInclusive(0, 255),
    b: randomIntInclusive(0, 255),
  };
}

/**
 * @summary Gets a random RGB color tuple.
 * @category Utils
 */
export function getRandomColorTuple(): RgbTuple {
  return [randomIntInclusive(0, 255), randomIntInclusive(0, 255), randomIntInclusive(0, 255)];
}
