import { BlinkStick } from './blinkstick';
import { LibUsbTransport } from '../transport/lib-usb-transport';

export class BlinkStickLibUsb extends BlinkStick<LibUsbTransport> {
  isSync = false;

  public constructor(transport: LibUsbTransport) {
    super(transport);
  }
}
