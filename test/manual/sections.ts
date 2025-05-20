import { basicQuestions } from './sections/basic';
import { legacyAnimations } from './sections/legacy-animations';
import { bulkApi } from './sections/bulk-api';
import { BlinkstickAny, BlinkstickDeviceDefinition } from '../../src';
import { animationApi } from './sections/animation-api';

export const sections = {
  Basic: basicQuestions,
  'Legacy animations': legacyAnimations,
  'Bulk API': bulkApi,
  'Animation API': animationApi,
} satisfies Record<
  string,
  (blinkstick: BlinkstickAny, description: BlinkstickDeviceDefinition) => Promise<void>
>;
