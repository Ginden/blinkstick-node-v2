/**
 * Determines report ID and number of LEDs for the report
 */
export function determineReportId(ledCount: number) {
  let reportId = 9;
  let maxLeds = 64;

  if (ledCount < 8 * 3) {
    reportId = 6;
    maxLeds = 8;
  } else if (ledCount < 16 * 3) {
    reportId = 7;
    maxLeds = 16;
  } else if (ledCount < 32 * 3) {
    reportId = 8;
    maxLeds = 32;
  }

  return { reportId, maxLeds };
}
