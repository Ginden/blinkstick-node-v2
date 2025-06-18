## Advanced concepts and recipes

### Custom transports

Core `BlinkStick` class takes instance of [`UsbTransport`](src/transport/usb-transport.ts) as constructor argument.

This is a very thin-layered abstraction over USB communication, so you can obviously implement your own transport layer.

For example, you can implement a transport layer that uses MQTT to communicate with a BlinkStick on RPi or write a transport using [`WebHID`](https://developer.mozilla.org/en-US/docs/Web/API/HIDDevice)

Running this code on web browser will not work without modifications, as `node-hid` is not available in browser environment.
