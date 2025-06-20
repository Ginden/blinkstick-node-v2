import type { BlinkStick } from './blinkstick';
import { ConditionalPick, JsonPrimitive } from 'type-fest';

/**
 * Utility type that constrains T - useful for development not to accidentally use key that is not in T.
 */
export type Constraint<T, U extends T> = U;

export type Properties = keyof ConditionalPick<BlinkStick, JsonPrimitive>;

export type SchedulableOperations = Constraint<
  keyof BlinkStick,
  | 'loadLedCountFromDevice'
  | 'sendFeatureReport'
  | 'setFeatureReport'
  | 'setMode'
  | 'getFeatureReport'
>;

/**
 * Limited version of BlinkStick that only includes schedulable operations and properties.
 * All of these operations are related to device configuration and state management.
 */
export type LimitedBlinkStick<B extends BlinkStick> = Pick<B, SchedulableOperations | Properties>;
