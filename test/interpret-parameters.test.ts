import { describe, it, expect } from 'vitest';
import {
  interpretParameters,
  interpretParametersInversed,
} from '../src/utils/colors/interpret-parameters';
import { Channel } from '../src/types/enums/channel';

describe('interpretParameters', () => {
  it('normalizes full hex string without options', () => {
    expect(interpretParameters('#102030')).toEqual({ r: 0x10, g: 0x20, b: 0x30, options: {} });
  });

  it('normalizes shorthand hex string with additional options', () => {
    const opts = { index: 2 };
    expect(interpretParameters('#abc', opts)).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc, options: opts });
  });

  it('normalizes CSS color name with options', () => {
    const opts = { channel: Channel.G };
    expect(interpretParameters('red', opts)).toEqual({ r: 255, g: 0, b: 0, options: opts });
  });

  it('normalizes numeric tuple with options', () => {
    const opts = { channel: Channel.B, index: 1 };
    expect(interpretParameters(1, 2, 3, opts)).toEqual({ r: 1, g: 2, b: 3, options: opts });
  });
});

describe('interpretParametersInversed', () => {
  it('inverts full hex string and preserves options', () => {
    expect(interpretParametersInversed('#000000')).toEqual({ r: 255, g: 255, b: 255, options: {} });
  });

  it('inverts CSS color name with options', () => {
    const opts = { index: 3 };
    expect(interpretParametersInversed('blue', opts)).toEqual({
      r: 255,
      g: 255,
      b: 0,
      options: opts,
    });
  });

  it('inverts numeric tuple', () => {
    expect(interpretParametersInversed(10, 20, 30)).toEqual({
      r: 245,
      g: 235,
      b: 225,
      options: {},
    });
  });
});
