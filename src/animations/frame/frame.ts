import type { SimpleFrame } from './simple-frame';
import type { ComplexFrame } from './complex-frame';
import type { WaitFrame } from './wait-frame';

/**
 * @summary Any frame type.
 * @category Animation
 */
export type Frame = SimpleFrame | ComplexFrame | WaitFrame;
