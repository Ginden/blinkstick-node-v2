import { assert } from 'tsafe';

/**
 * BlinkStick Nano has an effective frame rate of 70 FPS.
 * I don't expect that other devices will be able to handle more than 100 FPS (probably less).
 * This function asserts if the frame rate is below 100 FPS to prevent unexpected behavior for the user.
 * @param ms
 * @param steps
 * @category Animation
 */
export function assertFpsBelow100(ms: number, steps: number) {
  assert(steps > 0, `steps must be greater than 0. ms=${ms}, steps=${steps}`);
  const timePerFrame = ms / steps;
  assert(timePerFrame > 0, `timePerFrame must be greater than 0. ms=${ms}, steps=${steps}`);
  assert(timePerFrame >= 10, `timePerFrame must be at least 10ms. ms=${ms}, steps=${steps}`);
}
