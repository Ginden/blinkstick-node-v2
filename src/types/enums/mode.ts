export const BlinkStickProMode = {
  NORMAL: 0,
  // Seemingly,
  // some devices (aka "BlinkStick Pro" connected to IKEA Dioder) use
  // a mode where [0,0,0] is white and [255,255,255] is black.
  INVERSE: 1,
  // Smart Pixel mode, where each LED is a WS2812 LED.
  // This seems to be a default mode for all devices but BlinkStick Pro and original BlinkStick.
  WS2812: 2,
  /**
   * This mode is not documented in the official API, but it is used in the
   * BlinkStickClient .NET library:
   * @see https://github.com/arvydas/blinkstick-client/blob/5f32a3d8c812abf521f99d54196784ab38c80ba7/BlinkStickClient/Widgets/BlinkStickInfoWidget.cs#L72
   * @experimental
   */
  MULTI_LED_MIRROR: 3,
} as const;

export type BlinkStickProMode = (typeof BlinkStickProMode)[keyof typeof BlinkStickProMode];
