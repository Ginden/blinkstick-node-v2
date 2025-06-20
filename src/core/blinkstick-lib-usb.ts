import { BlinkStick } from './blinkstick';
import { LibUsbTransport } from '../transport/lib-usb-transport';

/**
 * Version of BlinkStick that uses libusb for communication.
 */
export class BlinkStickLibUsb extends BlinkStick<LibUsbTransport> {
  isSync = false;

  public constructor(transport: LibUsbTransport) {
    super(transport);
  }
}
