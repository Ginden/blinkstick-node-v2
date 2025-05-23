export function assertAnimationLength(elapsed: number, expected: number, tolerance: number = 0.05) {
  const lowerBound = expected - expected * tolerance;
  const upperBound = expected + expected * tolerance;
  if (elapsed > upperBound) {
    throw new Error(`Animation took too long. Expected: ${expected}ms, Actual: ${elapsed}ms`);
  } else if (elapsed < lowerBound) {
    throw new Error(`Animation took too short. Expected: ${expected}ms, Actual: ${elapsed}ms`);
  }
  console.log(
    `🕒 Animation took ${elapsed}ms (expected ${expected}ms), within tolerance of ${(tolerance * 100) | 0}%`,
  );
}
