import { describe, it, expect } from 'vitest';
import { combine } from './combine';
import { SimpleFrame } from '../frame/simple-frame';

describe('combine', () => {
  it('throws if no animations provided', () => {
    expect(() => combine()).toThrowError('At least one animation is required');
  });

  it('combines two animations sequentially', async () => {
    async function* a() {
      yield new SimpleFrame([1, 2, 3], 10);
      yield new SimpleFrame([4, 5, 6], 20);
    }
    async function* b() {
      yield new SimpleFrame([7, 8, 9], 30);
    }
    const result: SimpleFrame[] = [];
    for await (const frame of combine(a(), b())) {
      result.push(frame as SimpleFrame);
    }
    expect(result.map((f) => f.rgb)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(result.map((f) => f.duration)).toEqual([10, 20, 30]);
  });

  it('supports a single animation', async () => {
    async function* a() {
      yield new SimpleFrame([8, 8, 8], 5);
    }
    const result: SimpleFrame[] = [];
    for await (const frame of combine(a())) {
      result.push(frame as SimpleFrame);
    }
    expect(result).toHaveLength(1);
    expect(result[0].rgb).toEqual([8, 8, 8]);
    expect(result[0].duration).toBe(5);
  });
});
