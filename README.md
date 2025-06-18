# BlinkStick v2 – modern TypeScript SDK for BlinkStick LEDs

> Control your BlinkStick devices from Node.js with a **TypeScript-first, Promise-powered** API and a powerful animation engine.

## Why choose this fork?

- **Modern development stack** – written in TypeScript, ships with type definitions, uses modern JS features
- **Promises & `async`/`await` everywhere** – no legacy callbacks.
- **Rich animation toolkit** – create complex, FPS-safe animations with `Animation`, `AnimationBuilder` and helpers.
- **Color parsing super-powers** – English color names, CSS strings (`#ff0000`, `rgb(255,0,0)`), tuples… even `random`.
- **Support for async `node-hid` APIs** - you can control devices without blocking the event loop.
- **Works with the official BlinkStick devices**
- **Node 20+ ready** – leverages the latest language and runtime features.

---

### Quick install

```bash
npm i @ginden/blinkstick-v2
```

### Quick example

```ts
import { findFirstAsync } from '@ginden/blinkstick-v2';

// Find the first connected device (throws if none are found)
const blinkstick = await findFirstAsync();

// Make the LED pulse between black ↔ purple for ~1 s.
// The promise resolves with `undefined` once the pulse is finished.
await blinkstick.pulse('purple');
```

👉 **Need more?** Browse the full, searchable API reference at <https://ginden.github.io/blinkstick-node-v2>.

---

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [About this project](#about-this-project)
- [Changes from the original library in v2](#changes-from-the-original-library-in-v2)
- [Big changes in v3](#big-changes-in-v3)
  - [Known issues](#known-issues)
- [Devices](#devices)
- [Requirements](#requirements)
- [Install BlinkStick node module](#install-blinkstick-node-module)
- [Getting started](#getting-started)
  - [Async (recommended)](#async-recommended)
    - [Easy mistakes](#easy-mistakes)
  - [Sync API](#sync-api)
    - [Usage examples](#usage-examples)
- [Animation API](#animation-api)
  - [Generators](#generators)
  - [Limitations](#limitations)
  - [Known issues](#known-issues-1)
- [Missing information / help wanted 🕵️‍♀️](#missing-information-help-wanted-)
- [Permission problems](#permission-problems)
- [Contributing](#contributing)
- [Testing](#testing)
  - [Manual test](#manual-test)
  - [Automated tests](#automated-tests)
  - [Coverage](#coverage)
- [Maintainer](#maintainer)
  - [Original maintainers](#original-maintainers)
- [Copyright and License](#copyright-and-license)

<!-- TOC end -->

<!-- TOC --><a name="about-this-project"></a>

## About this project

This project is a **fork** of the original [blinkstick-node](https://github.com/arvydas/blinkstick-node) library.  
It aims to keep the spirit and feature-set of the original while bringing the code base into the modern TypeScript & Promise world.

BlinkStick Node provides an interface to control BlinkStick devices connected to your computer with Node.js.

What is BlinkStick? It's a tiny USB-controlled RGB LED device. Learn more at <https://www.blinkstick.com>.

<!-- TOC --><a name="changes-from-the-original-library-in-v2"></a>

## Changes from the original library in v2

- TypeScript
- All methods taking callbacks now return Promises
- Most animation methods allow `AbortSignal` (this is only partially supported, your mileage may vary)
- ~~Many methods return results of setting a feature report on device instead of `undefined`~~ (this one was reverted in v3, as it caused crashes)
- Requires Node.js 20.0 or higher

<!-- TOC --><a name="big-changes-in-v3"></a>

## Big changes in v3

- Added support for arbitrary animations
  - This is usable through `blinkstick.animation` namespace
  - `Animation` bag class for common animations
  - Exposed lots of lower-level animation methods
  - Exposed `AnimationBuilder` class for building animations
- Removed lots of low-level or unnecessary methods
- Added subclasses `BlinkStickSync` and `BlinkStickAsync` for sync and async APIs and future specialization
  - Future specializations will likely be `BlinkStickProSync` and `BlinkStickProAsync`, as the Pro device seems to have lots of unusual features

**BREAKING CHANGES**:

- Restored original return types of several methods
- No `string` when dealing with low-level data - use `Buffer` instead, we assume that you know what you are doing

### BlinkStick Flex on Linux

Devices with more than 21 LEDs (like BlinkStick Flex) are not supported by `node-hid` on Linux due to kernel limitations (required HID report size is larger than 64+1 bytes).

To avoid this, we use `usb` library. It must be installed as your dependency (`npm i usb`), as it's not pulled-in by default.

<!-- TOC --><a name="known-issues"></a>

### Known issues

- `BlinkStick Square` devices identify themselves as just `BlinkStick`. If you try to find base BlinkStick device using `findFirst("BlinkStick")`, it may find a `BlinkStick Square` instead. This is unlikely to affect users with only one BlinkStick device connected, but if you have both `BlinkStick` and `BlinkStick Square`, you may need to do some workarounds to distinguish them. Look at [consts/device-descriptions.ts](src/consts/device-descriptions.ts) for detection logic.
- `BlinkStick Flex` won't work on Linux due to kernel limitations.

<!-- TOC --><a name="devices"></a>

## Devices

If you want to gift or buy me a BlinkStick device for testing purposes, please email me.

**Tested**:

- BlinkStick Nano
- BlinkStick Square

**Should work**:

- BlinkStick
- BlinkStick Strip
- BlinkStick Strip Mini
- BlinkStick Flex on MacOS and Windows

**Does not work**:

- BlinkStick Flex on Linux

**Variable LED count**

_BlinkStick Flex_ and _BlinkStick Pro_ come with a variable number of LEDs.

Library by default assumes that you have maximal number of LEDs available.

If not, you can set the number of LEDs using `ledCount` property on `BlinkStick` instance:

```ts
blinkstick.ledCount = 42;
```

or write it permanently to the device using `setLedCount` method:

```ts
await blinkstick.setLedCount(42);
```

<!-- TOC --><a name="requirements"></a>

## Requirements

- Node.js, version 20.0 or higher

<!-- TOC --><a name="install-blinkstick-node-module"></a>

## Install BlinkStick node module

Install using npm:

```shell
npm install @ginden/blinkstick-v2
```

<!-- TOC --><a name="getting-started"></a>

## Getting started

<!-- TOC --><a name="async-recommended"></a>

### Async (recommended)

Using async APIs is the recommended way. While even sync APIs use Promises, they may block the event loop, which is not a
good practice.

Read docs of [`node-hid`](https://github.com/node-hid/node-hid?tab=readme-ov-file#async-vs-sync-api) for more
information.

Note: under the hood the async flavour wraps `node-hid`’s `HIDAsync` class, while the sync API talks to `HID`.  
The async version keeps the Node.js event loop free during USB I/O and is therefore recommended for most real-world applications.

```ts
import { BlinkStick, findFirstAsync } from '@ginden/blinkstick-v2';

const blinkstick = await findFirstAsync();
```

<!-- TOC --><a name="easy-mistakes"></a>

#### Easy mistakes

If you are using Async API, you might accidentally let `Blinkstick` instance to be garbage-collected. This will emit a
warning, because `Blinkstick` instance holds reference to C API object. To avoid it, just call `close` or
use [explicit resource management](https://github.com/tc39/proposal-explicit-resource-management).

Direct construction of `BlinkStick` is not recommended.

<!-- TOC --><a name="sync-api"></a>

### Sync API

```ts
import { BlinkStick, findFirst } from '@ginden/blinkstick-v2';

const blinkstick = findFirst();
```

<!-- TOC --><a name="usage-examples"></a>

#### Usage examples

```ts
// Color names are allowed
await blinkstick.pulse('red');
// "random" is also allowed
await blinkstick.pulse('random');
// RGB values are allowed
await blinkstick.pulse(100, 0, 0);
// RGB values as hex string are allowed
await blinkstick.pulse('#ff0000');
// RGB values as hex string are allowed
await blinkstick.pulse('ff0000');
// Well, even rgb(255, 0, 0) is allowed
await blinkstick.pulse('rgb(255, 0, 0)');

await blinkstick.setColor('red');

// Will work only if you have at least 2 LEDs
await blinkstick.led(0).setColor('green');
await blinkstick.led(1).setColor('blue');

// Set color of all LEDs
await blinkstick.leds().setColor('yellow');
```

<!-- TOC --><a name="animation-api"></a>

## Animation API

Let's start with an example:

```ts
import { findFirst, Animation } from '@ginden/blinkstick-v2';
// `animationApi` is **your own** module with helper functions;
// it is shown here only to illustrate that animations are just plain objects.
import { animationApi } from './animation-api';

const blinkstick = findFirst();

const animation = Animation.repeat(
  Animation.morphMany(['blue', 'purple', 'red', 'yellow', 'green', 'cyan'], 5000),
  12,
);

// Fire-and-forget – the call resolves immediately, the animation continues in the background
blinkstick.animation.runAndForget(animation);

// Or, let's consider using AnimationBuilder

import { AnimationBuilder } from '@ginden/blinkstick-v2';

const complexAnimation = AnimationBuilder.startWithBlack(50)
  // Add black-red-black pulse over 1 second
  .addPulse('red', 1000)
  // Appends new animation to the end of the current one
  .append(
    AnimationBuilder
      // Starts with white color
      .startWithColor('white', 1000)
      // Pulses to green over 500ms
      .addPulse('green', 500)
      // Pulses to yellow over 500ms
      .addPulse([255, 255, 0], 500)
      // Morphs to red over 500ms
      .morph(
        {
          r: 255,
          g: 0,
          b: 0,
        },
        500,
      )
      // Waits with result of previous steps for 1 second
      .wait(1000)
      .build(),
  )
  // Repeats the whole animation 3 times
  .repeat(3)
  // Wait with last frame for 1 second
  .wait(1000)
  // Morphs to purple over 1 second
  .morphToColor('purple', 1000)
  // This is really advanced feature that allows you to transform each frame
  .transformEachFrame((frame) => frame)
  .build();
```

`Animation` bag class is a simple convenience wrapper for several common animations and generates `FrameIterable` objects.

`AnimationBuilder` is a more advanced class that allows you to build complex animations.

What is `FrameIterable`?

```ts
type FrameIterable = Iterable<Frame> | AsyncIterable<Frame>;
```

`SimpleFrame` is a class of `{rgb: RgbTuple, duration: number}`. It's used by animation runner to change color of all LEDs at once.

`ComplexFrame` is a class of `{leds: RgbTuple[], duration: number}`. It's used by animation runner to change color of each LED separately. Number of LEDs must match the number of LEDs in the device.

`WaitFrame` is a class of `{duration: number}`. It's used by animation runner to wait for a given duration.

<!-- TOC --><a name="generators"></a>

### Generators

Most of Animation APIs will throw if you pass a generator. This is there to prevent you from shooting yourself in the foot.

Why?

```ts
import { SimpleFrame } from '@ginden/blinkstick-v2';

function* gen() {
  yield SimpleFrame.colorAndDuration('white', 500);
  yield SimpleFrame.colorAndDuration('red', 500);
}

repeat(gen(), 3);

// This would yield only 2 frames - generator doesn't implicitly "fork" when iterated multiple times
```

<!-- TOC --><a name="limitations"></a>

### Limitations

All built-in methods will throw if you try to generate animation with FPS higher than 100. As `BlinkStick Nano` is de facto limited to 75 FPS, it should be enough.

Your custom animation may be "faster" than that, but expect drift and other issues.

<!-- TOC --><a name="known-issues-1"></a>

### Known issues

- Dreaded `could not get feature report from device` - this error occurs somewhere in the `node-hid` library and its dependencies,
  and is most likely to occur when calling methods in tight loops. See https://github.com/node-hid/node-hid/issues/561

<!-- TOC --><a name="missing-information-help-wanted-"></a>

## Missing information / help wanted 🕵️‍♀️

The project is already usable in production, however some pieces of documentation are still scarce. Feel free to open a PR if you can help with any of the items below:

1. **Device matrix** – a table that documents which features work on every BlinkStick model (Nano, Strip, Flex, Pro…).
2. **LED channel / mode reference** – hands-on explanation of the low-level `setMode`, `setChannel` helpers and how they relate to the hardware.
3. **Standalone CLI**
4. **Animation cookbook** – ready-to-copy recipes such as breathing, rainbow cycles, theatre chase, progress bars, etc.
5. **Troubleshooting on Windows** – the `udev` paragraph covers Linux, but Windows quirks and Zadig drivers need love too.

Your contributions are highly appreciated! 🙏

<!-- TOC --><a name="permission-problems"></a>

## Permission problems

If you get an error message on Linux:

    Error: cannot open device with path /dev/hidraw0

Please run the following command:

    echo "KERNEL==\"hidraw*\", SUBSYSTEM==\"hidraw\", ATTRS{idVendor}==\"20a0\", ATTRS{idProduct}==\"41e5\", MODE=\"0666\"" | sudo tee /etc/udev/rules.d/85-blinkstick-hid.rules

Then either restart the computer or run the following command to reload udev rules:

    sudo udevadm control --reload-rules && sudo udevadm trigger

<!-- TOC --><a name="contributing"></a>

## Contributing

Open pull requests, you are welcome.

<!-- TOC --><a name="testing"></a>

## Testing

To run tests, you need to have Blinkstick device connected to your computer. This makes it impossible to run tests on
CI, and even typical automated testing is rather challenging.

<!-- TOC --><a name="manual-test"></a>

### Manual test

Run `npm run test:manual` and follow the instructions. You should physically see the device changing colors, and you
will answer yes/no to the questions.

<!-- TOC --><a name="automated-tests"></a>

### Automated tests

As most interesting parts of the library require a Blinkstick device and human eye to operate (both unavailable in GitHub Actions), we have rather limited automated tests, testing mostly utility functions and frame generation.

Just run `npm test` and it will run the tests.

<!-- TOC --><a name="coverage"></a>

### REPL

You can run `npm run repl` to start a REPL with the library loaded. This is useful for quick experiments and testing.

```bash
npm run repl
```

Then you can run commands like:

```ts
await blinkStickNano.morph('red');
```

### Debug device commands

You can track reads and writes to the device by setting certain environment variables.

Eg.

```
export BLINKSTICK_DEBUG="/tmp/b-%PID.log"
```

The following variables are interpolated:

- `%PID` – process ID of the current process
- `%RELEASE` - release version of the device
- `%SERIAL` - serial number of the device
- `%NAME` - name of the device

Then run your script, and it will log all reads and writes to the device to the specified file.

This file is line-delimited JSON, with each line being a single read or write operation.

### Coverage

A proper coverage report would run both manual and automated tests. Feel free to open a PR if you have an idea how to do it.

<!-- TOC --><a name="maintainer"></a>

## Maintainer

- Michał Wadas - [https://github.com/Ginden](https://github.com/Ginden)

<!-- TOC --><a name="original-maintainers"></a>

### Original maintainers

- Arvydas Juskevicius - [http://twitter.com/arvydev](http://twitter.com/arvydev)
- Paul Cuthbertson - [http://twitter.com/paulcuth](http://twitter.com/paulcuth)

<!-- TOC --><a name="copyright-and-license"></a>

## Copyright and License

Copyright (c) 2014 Agile Innovative Ltd and contributors
Copyright (c) 2025 Michał Wadas

Released under MIT license.
