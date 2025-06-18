# General

## Firmware

- You can find some firmware on [GitHub](https://github.com/arvydas/blinkstick-firmware)
- Code for newer devices is partially available on [other branches](https://github.com/arvydas/blinkstick-firmware/branches/all)
- But this firmware is not complete - it doesn't include certain known feature reports
- Feature reports were partially documented by [subzey](https://github.com/subzey/blinkstick-webhid)
- You can read my code partially documenting them in [feature-reports](src/types/enums/feature-report.ts)
- There is undocumented feature report `0x81` which stores LED count.
  - Writing to it fails with error on my devices, but reading returns updated value after an unplugging device, implying that value is saved to RAM upon boot, and feature report updates only non-volatile memory

## Linux compatibility

- BlinkStick Flex, and likely BlinkStick Pro, devices are **NOT** fully compatible with Linux
- Why?
  - Hidraw driver in Linux kernel doesn't allow sending feature reports bigger than `64` bytes
  - Windows and MacOS use larger buffers, up to `512` bytes
  - BlinkStick Flex expects to receive buffer of `1+16*3=49` bytes for setting first 16 LEDs, but next step is `1+32*3 = 97` bytes - way above 64 bytes
  - Workaround to send multiple feature reports for LEDs beyond 16 results in USB driver errors (this occurs both on `libusb` and `hidapi` wrappers) after LED 22 (some users report failure above LED 20)
- Based on reading Python code, it seems that BlinkStick Pro has similiar issue
  - BlinkStick Pro has up to 192 LEDs, so it would require sending feature reports of `1+192*3=577` bytes, exceeding even Windows/MacOS limits
  - Data is sent per-channel (R/G/B) - so it would require 3 feature reports of `1+64*3=193` bytes each, which is still above 64 bytes limit

## Hardware

Currently, I own BlinkStick Nano, BlinkStick Flex and BlinkStick Square devices.

- BlinkStick Nano
  - Highly recommended
- BlinkStick Flex
  - Not recommended for Linux users
- BlinkStick Square
  - I recommend custom diffuser, as default one creates a light-cube effect - negating the benefits of having individually addressable LEDs.
