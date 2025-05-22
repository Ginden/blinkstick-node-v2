export function assertFpsBelow100(ms: number, steps: number) {
  const timePerFrame = ms / steps;
  if (timePerFrame < 10) {
    throw new Error(`Frame FPS is too high. duration=${ms}, `);
  }
}
