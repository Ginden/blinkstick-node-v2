## Advanced concepts and recipes

### Custom transports

Core `BlinkStick` class takes instance of [`UsbTransport`](src/transport/usb-transport.ts) as constructor argument.

This is a very thin-layered abstraction over USB communication, so you can obviously implement your own transport layer.

For example, you can implement a transport layer that uses MQTT to communicate with a BlinkStick on RPi or write a transport using [`WebHID`](https://developer.mozilla.org/en-US/docs/Web/API/HIDDevice)

Running this code on web browser will not work without modifications, as `node-hid` is not available in browser environment.

### `.schedule()` method

`.schedule()` is a convenience method that allows you to perform initialization of sync API device without dealing with asynchronous code at the top level.

These methods will be executed in the order they are called before the next color set or other operation is performed.

Only a limited set of methods is exposed in a type system to avoid infinite loops and other issues.

Example:

```typescript
import { findFirst } from '@ginden/blinkstick-v2';

findFirst()
  .schedule((b) => b.setMode(2))
  .schedule((b) => b.loadLedCountFromDevice());
```
