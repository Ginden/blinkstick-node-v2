import type { Device } from 'node-hid';

/**
 * Simple type that describes a Blinkstick device.
 */
export type BlinkstickDeviceDefinition = {
  // Number of LEDs
  ledCount: number;
};

/**
 * Known Blinkstick devices and their LED counts.
 */
export const deviceDescriptions = {
  // This one is tested...
  'BlinkStick Nano': {
    test: (d) => d.product === 'BlinkStick Nano',
    description: {
      ledCount: 2,
    },
  },
  'BlinkStick Square': {
    test: (d) =>
      !!(
        d.product === 'BlinkStick Square' ||
        (d.product === 'BlinkStick' && d.serialNumber?.startsWith('BS063819') && d.release === 512)
      ),
    description: {
      ledCount: 8,
    },
  },
  'BlinkStick Strip': {
    test: (d) => d.product === 'BlinkStick Strip',
    description: {
      ledCount: 8,
    },
  },
  'BlinkStick Strip Mini': {
    test: (d) => d.product === 'BlinkStick Strip Mini',
    description: {
      ledCount: 4,
    },
  },
  BlinkStick: {
    test: (d) => d.product === 'BlinkStick',
    description: {
      ledCount: 1,
    },
  },
  'BlinkStick Pro': {
    test: (d) => d.product === 'BlinkStick Pro',
    description: {
      ledCount: 192,
    },
  },
  'BlinkStick Flex': {
    test: (d) => d.product === 'BlinkStick Flex',
    description: {
      ledCount: 32,
    },
  },
} as const satisfies Record<
  string,
  {
    test: (device: Device) => boolean;
    description: BlinkstickDeviceDefinition;
  }
>;

export function attemptToGetDeviceDescription(device: Device) {
  for (const [name, { test, description }] of Object.entries(deviceDescriptions)) {
    if (test(device)) {
      return {
        name,
        ...description,
      };
    }
  }
  return null;
}
