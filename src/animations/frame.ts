import { SimpleFrame } from './simple-frame';
import { ComplexFrame } from './complex-frame';
import { NullFrame } from './null-frame';

export type Frame = SimpleFrame | ComplexFrame | NullFrame;
