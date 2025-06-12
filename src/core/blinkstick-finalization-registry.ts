import { HIDAsync } from 'node-hid';

/**
 * A FinalizationRegistry to ensure that HIDAsync devices are closed properly
 * @category Implementation details
 */
export const blinkstickFinalizationRegistry = new FinalizationRegistry((hidDevice: HIDAsync) => {
  // Access undocumented _closed property to check if the device is already closed
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
