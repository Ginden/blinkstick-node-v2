export const BlinkStickProMode = {
  NORMAL: 0,
  INVERSE: 1,
  WS2812: 2,
  // https://github.com/arvydas/blinkstick-client/blob/5f32a3d8c812abf521f99d54196784ab38c80ba7/BlinkStickClient/Widgets/BlinkStickInfoWidget.cs#L72
  // This code suggests that 3 may be a valid mode?
} as const;

export type BlinkStickProMode = (typeof BlinkStickProMode)[keyof typeof BlinkStickProMode];
