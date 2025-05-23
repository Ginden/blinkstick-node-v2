import { describe, it, expect } from 'vitest';
import { morphBetweenComplexFrames, morphComplex } from './morph-complex';
import { SimpleFrame } from '../frame/simple-frame';
import { asyncCollect } from '../helpers/iterate';
import { ComplexFrame } from '../frame/complex-frame';

describe('morphComplex', () => {
  const blackFrame = SimpleFrame.colorAndDuration('black', 100);
  const whiteFrame = SimpleFrame.colorAndDuration('white', 100);

  it('throws if steps <= 0', () => {
    expect(() => morphComplex([blackFrame], [whiteFrame], 100, 0)).toThrowError();
  });

  it('yields correct frames and colors for SimpleFrames', async () => {
    const frames = await asyncCollect(morphComplex([blackFrame], [whiteFrame], 100, 5));

    // This one passes
    expect(frames.map((f) => (f as SimpleFrame).rgb[0])).toEqual([0, 42, 85, 127, 170, 212, 255]);

    // This one fails with frames.length = 9
    expect(frames).toHaveLength(7);
  });

  it(`yields correct number of frames and colors for ComplexFrames`, async () => {
    const complexFrame1 = new ComplexFrame(
      [
        [0, 0, 0],
        [240, 0, 0],
      ],
      100,
    );
    const complexFrame2 = new ComplexFrame(
      [
        [240, 0, 0],
        [0, 0, 0],
      ],
      100,
    );

    const frames = await asyncCollect(morphComplex([complexFrame1], [complexFrame2], 100, 1));
    expect(frames).toHaveLength(3);
  });
});

describe(morphBetweenComplexFrames.name, () => {
  it('morphs between two complex frames', () => {
    const complexFrame1 = new ComplexFrame(
      [
        [0, 0, 0],
        [240, 0, 0],
      ],
      100,
    );
    const complexFrame2 = new ComplexFrame(
      [
        [240, 0, 0],
        [0, 0, 0],
      ],
      100,
    );
    const frames = [...morphBetweenComplexFrames(complexFrame1, complexFrame2, 100, 2)];
    expect(frames).toHaveLength(2);
    expect(frames[0].colors).toEqual([
      [80, 0, 0],
      [160, 0, 0],
    ]);
    expect(frames[0].duration).toEqual(50);
    expect(frames[1].colors).toEqual([
      [160, 0, 0],
      [80, 0, 0],
    ]);
    expect(frames[1].duration).toEqual(50);
  });
});
