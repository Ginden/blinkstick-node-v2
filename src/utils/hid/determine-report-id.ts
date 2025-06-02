/**
 * Determines report ID and number of LEDs for the report
 */
export function determineReportId(ledCount: number) {
  let reportId = 9;
  let maxLeds = 64;

  // WEIRD - Python code uses `<=`, but Node code used `<` here.
  if (ledCount <= 8 * 3) {
    reportId = 6;
    maxLeds = 8;
  } else if (ledCount <= 16 * 3) {
    reportId = 7;
    maxLeds = 16;
  } else if (ledCount <= 32 * 3) {
    reportId = 8;
    maxLeds = 32;
  } else if (ledCount <= 64 * 3) {
    reportId = 9;
    maxLeds = 64;
  }

  return { reportId, maxLeds };
}
