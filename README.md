This is a fork of [Blinkstick library](https://github.com/arvydas/blinkstick-node), but now in TypeScript with Promises.

BlinkStick Node provides an interface to control Blinkstick
devices connected to your computer with Node.js.

What is BlinkStick? It's a smart USB-controlled LED device. More info about it here:

[http://www.blinkstick.com](http://www.blinkstick.com)

## Changes from original library

- TypeScript
- All methods taking callbacks now return Promises
- Most animation methods allow AbortSignal
- Many methods return results of setting a feature report on device instead of `undefined`]
- Requires Node.js 20.0 or higher

### Tested devices

- BlinkStick Nano

If you want to buy me a BlinkStick device for testing purposes, please email me.

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

Using async APIs is the recommended way. While even sync APIs use Promises, they block the event loop, which is not a
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
```

## Permission problems

If you get an error message on Linux:

    Error: cannot open device with path /dev/hidraw0

Please run the following command and restart your computer:

    echo "KERNEL==\"hidraw*\", SUBSYSTEM==\"hidraw\", ATTRS{idVendor}==\"20a0\", ATTRS{idProduct}==\"41e5\", MODE=\"0666\"" | sudo tee /etc/udev/rules.d/85-blinkstick-hid.rules

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
