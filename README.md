This is a fork of [Blinkstick library](https://github.com/arvydas/blinkstick-node), but now in TypeScript with Promises.

BlinkStick Node provides an interface to control Blinkstick
devices connected to your computer with Node.js.

What is BlinkStick? It's a smart USB-controlled LED device. More info about it here:

[http://www.blinkstick.com](http://www.blinkstick.com)

## Changes from the original library in v2

- TypeScript
- All methods taking callbacks now return Promises
- Most animation methods allow `AbortSignal` (this is only partially supported, your mileage may vary)
- ~ Many methods return results of setting a feature report on device instead of `undefined` ~ (this one was reverted in v3, as it caused crashes)
- Requires Node.js 20.0 or higher

## Big changes in v3

- Added support for arbitrary animations
  - This is usable through `blinkstick.animation` namespace
  - `Animation` bag class for common animations
  - Exposed lots of lower-level animation methods
  - Exposed `AnimationBuilder` class for building animations
- Removed lots of low-level or unnecessary methods
- Added subclasses `BlinkStickSync` and `BlinkStickAsync` for sync and async APIs and future specialization
  - Likely future specialization will be `BlinkStickProSync` and `BlinkStickProAsync`, as the Pro device seems to have lots of unusual features

**BREAKING CHANGES**:

- Restored original return types of several methods
- No `string` when dealing with low-level data - use `Buffer` instead, we assume that you know what you are doing

### Devices

If you want to gift or buy me a BlinkStick device for testing purposes, please email me.

**Tested**:

- BlinkStick Nano

**Should work**:

- BlinkStick
- BlinkStick Strip
- Blinkstick Strip Mini

**\*Variable LED count**

_BlinkStick Flex_ and _BlinkStick Pro_ come with a variable number of LEDs.

This library _probably can_ work with them, but you need to set the number of LEDs in the constructor before using any method.

```ts
blinkstick.ledCount = 42;
```

If you don't set the number of LEDs, the library will assume that you have one LED.

## Requirements

- Node.js, version 20.0 or higher

## Install BlinkStick node module

Install using npm:

```shell
npm install @ginden/blinkstick-v2
```

## Getting started

### Async (recommended)

Using async APIs is the recommended way. While even sync APIs use Promises, they may block the event loop, which is not a
good practice.

Read docs of [`node-hid`](https://github.com/node-hid/node-hid?tab=readme-ov-file#async-vs-sync-api) for more
information.

```ts
import { BlinkStick, findFirstAsync } from '@ginden/blinkstick-v2';

const blinkstick = await findFirstAsync();
```

#### Easy mistakes

If you are using Async API, you might accidentally let `Blinkstick` instance to be garbage-collected. This will emit a
warning, because `Blinkstick` instance holds reference to C API object. To avoid it, just call `close` or
use [explicit resource management](https://github.com/tc39/proposal-explicit-resource-management).

Direct construction of `BlinkStick` is not recommended.

### Sync API

```ts
import { BlinkStick, findFirst } from '@ginden/blinkstick-v2';

const blinkstick = findFirst();
```

### Usage

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

## Async API

Currently, both APIs are identical in functionality and API. The only difference is that async API uses internally `HIDAsync`
from `node-hid` library, while sync API uses `HID`.

### Animation API

Let's start with an example:

```ts
import { findFirst, Animation } from '@ginden/blinkstick-v2';
import { animationApi } from './animation-api';

const blinkstick = findFirst();

const animation = Animation.repeat(
  Animation.morphMany(['blue', 'purple', 'red', 'yellow', 'green', 'cyan'], 5000),
  12,
);

blinkstick.animation.runAndForget(animation);

// Or, let's consider using AnimationBuilder

import { AnimationBuilder } from '@ginden/blinkstick-v2';

const complexAnimation = AnimationBuilder.startWithBlack(50)
  // Add black-read-black pulse over 1 second
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

### Limitations

All built-in methods will throw if you try to generate animation with FPS higher than 100. As `BlinkStick Nano` is de facto limited to 75 FPS, it should be enough.

Your custom animation may be "faster" than that, but expect drift and other issues.

### Known issues

- Dreaded `could not get feature report from device` - this error occurs somewhere in the `node-hid` library and its dependencies,
  and is most likely to occur when calling methods in tight loops. See https://github.com/node-hid/node-hid/issues/561

## Permission problems

If you get an error message on Linux:

    Error: cannot open device with path /dev/hidraw0

Please run the following command:

    echo "KERNEL==\"hidraw*\", SUBSYSTEM==\"hidraw\", ATTRS{idVendor}==\"20a0\", ATTRS{idProduct}==\"41e5\", MODE=\"0666\"" | sudo tee /etc/udev/rules.d/85-blinkstick-hid.rules

Then either restart the computer or run the following command to reload udev rules:

    sudo udevadm control --reload-rules && sudo udevadm trigger

## Contributing

Open pull requests, you are welcome.

## Testing

To run tests, you need to have Blinkstick device connected to your computer. This makes it impossible to run tests on
CI, and even typical automated testing is rather challenging.

### Manual test

Run `npm run test:manual` and follow the instructions. You should physically see the device changing colors, and you
will answer yes/no to the questions.

### Automated tests

As most interesting parts of the library require a Blinkstick device and human eye to operate (both unavailable in GitHub Actions), we have rather limited automated tests, testing mostly utility functions and frame generation.

Just run `npm test` and it will run the tests.

### Coverage

A proper coverage report would run both manual and automated tests. Feel free to open a PR if you have an idea how to do it.

## Maintainer

- Michał Wadas - [https://github.com/Ginden](https://github.com/Ginden)

### Original maintainers

- Arvydas Juskevicius - [http://twitter.com/arvydev](http://twitter.com/arvydev)
- Paul Cuthbertson - [http://twitter.com/paulcuth](http://twitter.com/paulcuth)

## Copyright and License

Copyright (c) 2014 Agile Innovative Ltd and contributors
Copyright (c) 2025 Michał Wadas

Released under MIT license.
