/**
 * @summary BlinkStick modes (applicable to BlinkStick Pro).
 * @category Constants
 * @enum
 */
export const BlinkStickProMode = {
  /**
   * @remarks Normal mode, used by ORIGINAL BlinkStick,
   */
  NORMAL: 0,
  /**
   * @remarks Inverse mode, where [0,0,0] is white and [255,255,255] is black.
   * Used by some devices like "BlinkStick Pro" connected to IKEA Dioder.
   */
  INVERSE: 1,
  /**
   * @remarks WS2812 mode, where each LED is a WS2812 LED.
   * This seems to be a default mode for all devices but BlinkStick Pro and original BlinkStick
   */
  WS2812: 2,
  /**
   * @remarks This mode is not documented in the official API nor in open-source firmware, but it is used in the BlinkStickClient .NET library:
   * @see [github.com/arvydas/blinkstick-client/BlinkStickClient/Widgets/BlinkStickInfoWidget.cs](https://github.com/arvydas/blinkstick-client/blob/5f32a3d8c812abf521f99d54196784ab38c80ba7/BlinkStickClient/Widgets/BlinkStickInfoWidget.cs#L72)
   * @experimental
   */
  MULTI_LED_MIRROR: 3,
} as const;

/**
 * @category Constants
 * @internal
 */
export type BlinkStickProMode = (typeof BlinkStickProMode)[keyof typeof BlinkStickProMode];
