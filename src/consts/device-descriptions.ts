import { MinimalDeviceInfo } from '../transport';

/**
 * Simple type that describes a Blinkstick device.
 * @category Constants
 */
export type BlinkstickDeviceDefinition = {
  // Number of LEDs
  ledCount: number;
  variableLedCount?: boolean;
};

/**
 * Known Blinkstick devices and their LED counts.
 * Have a look at https://github.com/arvydas/blinkstick-python/blob/master/blinkstick/blinkstick.py#L302 to see existing code.
 * @category Constants
 */
export const deviceDescriptions = {
  'BlinkStick Nano': {
    test: (d) => d.product === 'BlinkStick Nano' || d.release === 0x202,
    description: {
      ledCount: 2,
    },
  },
  'BlinkStick Square': {
    test: (d) =>
      !!(
        d.product === 'BlinkStick Square' ||
        (d.product === 'BlinkStick' &&
          d.serialNumber?.startsWith('BS063819') &&
          d.release === 0x200)
      ),
    description: {
      ledCount: 8,
    },
  },
  'BlinkStick Strip': {
    test: (d) => d.product === 'BlinkStick Strip' || d.release === 0x201,
    description: {
      ledCount: 8,
    },
  },
  'BlinkStick Strip Mini': {
    // Is this even a thing? It's not in BlinkStick Python code, so it's possible it identifies itself as "Strip"
    test: (d) => d.product === 'BlinkStick Strip Mini',
    description: {
      ledCount: 4,
    },
  },
  /**
   * @experimental
   */
  'BlinkStick Pro': {
    // TODO: add serial-number test
    test: (d) => d.product === 'BlinkStick Pro',
    description: {
      ledCount: 192,
      variableLedCount: true,
    },
  },
  /**
   * @experimental
   */
  'BlinkStick Flex': {
    test: (d) => d.product === 'BlinkStick Flex' || d.release === 0x203,
    description: {
      ledCount: 32,
      variableLedCount: true,
    },
  },
  BlinkStick: {
    // Some BlinkStick devices are just called "BlinkStick" without any additional info, even though they are not the original BlinkStick.
    test: (d) => d.product === 'BlinkStick',
    description: {
      ledCount: 1,
    },
  },
} as const satisfies Record<
  string,
  {
    test: (device: MinimalDeviceInfo) => boolean;
    description: BlinkstickDeviceDefinition;
  }
>;

export type KnownDeviceName = keyof typeof deviceDescriptions;

export function attemptToGetDeviceDescription(device: MinimalDeviceInfo) {
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
