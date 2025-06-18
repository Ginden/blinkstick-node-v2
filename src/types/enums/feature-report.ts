/**
 * Based on https://github.com/subzey/blinkstick-webhid
 */
export const FeatureReportDescription = {
  SetFirst: {
    reportId: 0x01,
    bufferLength: 3,
  },
  InfoBlock1: {
    reportId: 0x02,
    bufferLength: 32,
  },
  InfoBlock2: {
    reportId: 0x03,
    bufferLength: 32,
  },
  SetMode: {
    reportId: 0x04,
    bufferLength: 1,
  },
  SetArbitraryPixel: {
    reportId: 0x05,
    bufferLength: 5,
  },
  Set8Pixels: {
    reportId: 0x06,
    bufferLength: 1 + 3 * 8,
  },
  Set16Pixels: {
    reportId: 0x07,
    bufferLength: 1 + 3 * 16,
  },
  Set32Pixels: {
    reportId: 0x08,
    bufferLength: 1 + 3 * 32,
  },
  Set64Pixels: {
    reportId: 0x09,
    bufferLength: 1 + 3 * 64,
  },
} as const;

export const FeatureReportId = Object.fromEntries(
  Object.entries(FeatureReportDescription).map(([key, value]) => [key, value.reportId]),
) as {
  [key in keyof typeof FeatureReportDescription]: (typeof FeatureReportDescription)[key]['reportId'];
};
