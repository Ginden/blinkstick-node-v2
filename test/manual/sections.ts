import { basicQuestions } from './sections/basic';
import { legacyAnimations } from './sections/legacy-animations';
import { bulkApi } from './sections/bulk-api';
import { BlinkstickAny, BlinkstickDeviceDefinition } from '../../src';
import { animationApi } from './sections/animation-api';

export type SectionDefinition = {
  enabled: boolean;
  test: () => Promise<void>;
};

export type SectionFn = (
  blinkstick: BlinkstickAny,
  description: BlinkstickDeviceDefinition,
) => Record<string, SectionDefinition>;

export const sections = {
  Basic: basicQuestions,
  'Legacy animations': legacyAnimations,
  'Bulk API': bulkApi,
  'Animation API': animationApi,
} satisfies Record<string, SectionFn>;
