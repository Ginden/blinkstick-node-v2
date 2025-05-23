import { ColorObject, RgbTuple } from '../../types';
import { randomIntInclusive } from '../random-int-inclusive';

export function getRandomColor(): ColorObject {
  return {
    r: randomIntInclusive(0, 255),
    g: randomIntInclusive(0, 255),
    b: randomIntInclusive(0, 255),
  };
}

export function getRandomColorTuple(): RgbTuple {
  return [randomIntInclusive(0, 255), randomIntInclusive(0, 255), randomIntInclusive(0, 255)];
}
