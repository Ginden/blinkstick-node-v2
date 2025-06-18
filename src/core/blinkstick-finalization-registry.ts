import { LibUsbTransport } from '../transport/lib-usb-transport';
import { NodeHidAsyncTransport } from '../transport';

/**
 * A FinalizationRegistry to ensure that HIDAsync devices are closed properly
 * @category Implementation details
 */
export const blinkstickFinalizationRegistry = new FinalizationRegistry(
  (hidDevice: LibUsbTransport | NodeHidAsyncTransport) => {
    if (hidDevice instanceof LibUsbTransport) {
      process.emitWarning(
        `LIBUSB device was not closed properly. Ensure call to Blinkstick.close() before it's garbage collected.`,
      );
      hidDevice.close().catch((err: unknown) => {
        setImmediate(() => {
          throw err;
        });
      });
    } else if (hidDevice instanceof NodeHidAsyncTransport) {
      // Access undocumented _closed property to check if the device is already closed
      const isClosed = (hidDevice as unknown as { device: { _closed: boolean } }).device._closed;
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
    }
  },
);
