import { FeatureReportId } from '../../types';

/**
 * Determines report ID and number of LEDs for the report
 */
export function determineReportId(ledCount: number): {
  reportId: FeatureReportId;
  maxLeds: number;
} {
  // WEIRD - Python code uses `<=`, but Node code used `<` here.
  if (ledCount <= 8 * 3) {
    return {
      reportId: FeatureReportId.Set8Pixels,
      maxLeds: 8,
    };
  } else if (ledCount <= 16 * 3) {
    return {
      reportId: FeatureReportId.Set16Pixels,
      maxLeds: 16,
    };
  } else if (ledCount <= 32 * 3) {
    return {
      reportId: FeatureReportId.Set32Pixels,
      maxLeds: 32,
    };
  } else if (ledCount <= 64 * 3) {
    return {
      reportId: FeatureReportId.Set64Pixels,
      maxLeds: 64,
    };
  }

  return { reportId: FeatureReportId.Set64Pixels, maxLeds: 64 };
}
