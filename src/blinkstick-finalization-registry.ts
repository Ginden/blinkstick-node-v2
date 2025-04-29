import { HIDAsync } from 'node-hid';

export const blinkstickFinalizationRegistry = new FinalizationRegistry((hidDevice: HIDAsync) => {
  const isClosed = (hidDevice as unknown as { _closed: boolean })._closed;
  if (isClosed) {
    return;
  } else {
    process.emitWarning(
      `HID device was not closed properly. Ensure call to Blinkstick.close() before it's garbage collected.`,
    );
    hidDevice.close().catch((err: unknown) => {
      setImmediate(() => {
        throw err;
      });
    });
  }
});
