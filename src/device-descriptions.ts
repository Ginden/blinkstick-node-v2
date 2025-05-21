/**
 * Simple type that describes a Blinkstick device.
 */
export type BlinkstickDeviceDefinition = {
  // Number of LEDs
  ledCount: number;
};

export const deviceDescriptions = {
  // This one is tested...
  'BlinkStick Nano': {
    ledCount: 2,
  },
  'BlinkStick Square': {
    ledCount: 8,
  },
  'BlinkStick Strip': {
    ledCount: 8,
  },
  'BlinkStick Strip Mini': {
    ledCount: 4,
  },
  BlinkStick: {
    ledCount: 1,
  },
  'BlinkStick Pro': {
    ledCount: 192,
  },
} as const satisfies Record<string, BlinkstickDeviceDefinition>;
