/**
 * BlinkStick Nano has an effective frame rate of 70 FPS.
 * I don't expect that other devices will be able to handle more than 100 FPS (probably less).
 * This function asserts if the frame rate is below 100 FPS to prevent unexpected behavior for the user.
 * @param ms
 * @param steps
 * @category Animation
 */
export function assertFpsBelow100(ms: number, steps: number) {
  const timePerFrame = ms / steps;
  if (timePerFrame < 10) {
    throw new Error(`Frame FPS is too high. duration=${ms}, `);
  }
}
