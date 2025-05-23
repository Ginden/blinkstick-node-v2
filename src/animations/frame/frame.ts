import { SimpleFrame } from './simple-frame';
import { ComplexFrame } from './complex-frame';
import { WaitFrame } from './wait-frame';

export type Frame = SimpleFrame | ComplexFrame | WaitFrame;
