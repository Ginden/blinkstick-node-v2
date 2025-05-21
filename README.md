This is a fork of [Blinkstick library](https://github.com/arvydas/blinkstick-node), but now in TypeScript with Promises.

BlinkStick Node provides an interface to control Blinkstick
devices connected to your computer with Node.js.

What is BlinkStick? It's a smart USB-controlled LED device. More info about it here:

[http://www.blinkstick.com](http://www.blinkstick.com)

## Changes from original library

- TypeScript
- All methods taking callbacks now return Promises
- Most animation methods allow `AbortSignal` (this is only partially supported, your mileage may vary)
- Many methods return results of setting a feature report on device instead of `undefined`]
- Requires Node.js 20.0 or higher

## Big changes in v3

- Added support for arbitrary animations
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

***Variable LED count**

_BlinkStick Flex_ and _BlinkStick Pro_ come with a variable number of LEDs.

This library _probably can_ work with them, but you need to set the number of LEDs in the constructor before using any method.

```ts
blinkstick.ledCount = 42;
```

If you don't set the number of LEDs, the library will assume that you have one LED.

## Requirements

- Node.js, version 20.0 or higher
- Libusb for Mac OSX and Linux

#### Raspberry Pi

Install `libudev` and `libusb` development packages:

```shell
sudo apt-get install libusb-1.0-0-dev libudev-dev -y
```

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
import {findFirst, Animation} from "@ginden/blinkstick-v2";
import {animationApi} from "./animation-api";

const blinkstick = findFirst();

const animation = Animation.repeat(Animation.morphMany([
  'blue',
  'purple',
  'red',
  'yellow',
  'green',
  'cyan'
], 5000), 12);

blinkstick.animation.runAndForget(animation);
```

`Animation` class is a simple convenience wrapper for several common animations and generates `AnimationDescription` objects.

What is `AnimationDescription`? It's an iterable object that contains all the frames of the animation.

```ts
export type AnimationDescription =
        | Iterable<SimpleFrame | ComplexFrame>
        | AsyncIterable<SimpleFrame | ComplexFrame>;
```

`SimpleFrame` is a class of `{rgb: RgbTuple, duration: number}`. It's used by animation runner to change color of all LEDs at once.

`ComplexFrame` is a class of `{leds: RgbTuple[], duration: number}`. It's used by animation runner to change color of each LED separately. Number of LEDs must match the number of LEDs in the device.

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

### Automated tests (limited)

Just run `npm test` and it will run the tests. You can also run `npm test -- --watch` to run the tests in watch mode.

## Maintainer

- Michał Wadas - [https://github.com/Ginden](https://github.com/Ginden)

### Original maintainers

- Arvydas Juskevicius - [http://twitter.com/arvydev](http://twitter.com/arvydev)
- Paul Cuthbertson - [http://twitter.com/paulcuth](http://twitter.com/paulcuth)

## Copyright and License

Copyright (c) 2014 Agile Innovative Ltd and contributors

Released under MIT license.
