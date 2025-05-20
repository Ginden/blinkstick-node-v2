import { ColorObject } from '../../types';
import { randomIntInclusive } from '../random-int-inclusive';

export function getRandomColor(): ColorObject {
  return {
    r: randomIntInclusive(0, 255),
    g: randomIntInclusive(0, 255),
    b: randomIntInclusive(0, 255),
  };
}
