import { FeatureReportId } from '../../types';

/**
 * Determines report ID and number of LEDs for the report
 */
export function determineReportId(ledCount: number) {
  let reportId: number = FeatureReportId.Set64Pixels; // Default to the largest report ID
  let maxLeds = 64;

  // WEIRD - Python code uses `<=`, but Node code used `<` here.
  if (ledCount <= 8 * 3) {
    reportId = FeatureReportId.Set8Pixels;
    maxLeds = 8;
  } else if (ledCount <= 16 * 3) {
    reportId = FeatureReportId.Set16Pixels;
    maxLeds = 16;
  } else if (ledCount <= 32 * 3) {
    reportId = FeatureReportId.Set32Pixels;
    maxLeds = 32;
  } else if (ledCount <= 64 * 3) {
    reportId = FeatureReportId.Set64Pixels;
    maxLeds = 64;
  }

  return { reportId, maxLeds };
}
