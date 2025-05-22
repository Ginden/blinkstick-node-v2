import { describe, it, expect } from 'vitest';
import { morphBetweenComplexFrames, morphComplex } from './morph-complex';
import { SimpleFrame } from '../simple-frame';
import { asyncCollect } from '../helpers/iterate';
import { ComplexFrame } from '../complex-frame';

describe('morphComplex', () => {
  const blackFrame = SimpleFrame.colorAndDuration('black', 100);
  const whiteFrame = SimpleFrame.colorAndDuration('white', 100);

  it('throws if steps <= 0', () => {
    expect(() => morphComplex([blackFrame], [whiteFrame], 100, 0)).toThrowError();
  });

  it('yields correct frames and colors for SimpleFrames', async () => {
    const frames = await asyncCollect(morphComplex([blackFrame], [whiteFrame], 100, 5));
    expect(frames).toHaveLength(7);
    expect(frames[0]).toEqual(SimpleFrame.colorAndDuration([0, 0, 0], 100));
    expect(frames[1]).toEqual(SimpleFrame.colorAndDuration([36, 36, 36], 20));
    expect(frames[2]).toEqual(SimpleFrame.colorAndDuration([73, 73, 73], 20));
    expect(frames[3]).toEqual(SimpleFrame.colorAndDuration([109, 109, 109], 20));
    expect(frames[4]).toEqual(SimpleFrame.colorAndDuration([146, 146, 146], 20));
    expect(frames[5]).toEqual(SimpleFrame.colorAndDuration([182, 182, 182], 20));
    expect(frames[6]).toEqual(SimpleFrame.colorAndDuration([219, 219, 219], 20));
    expect(frames[7]).toEqual(SimpleFrame.colorAndDuration([255, 255, 255], 100));
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
