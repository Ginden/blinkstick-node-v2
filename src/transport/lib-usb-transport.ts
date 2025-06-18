import { MinimalDeviceInfo, UsbTransport } from './usb-transport';
import type { Device } from 'usb';
import { promisify } from 'node:util';

function isDeviceOpen(device: Device): boolean {
  return Boolean(device.interfaces);
}

export class LibUsbTransport extends UsbTransport {
  protected readonly wIndex = 0;
  public constructor(
    public device: Device,
    private readonly minimalDeviceInfo: MinimalDeviceInfo,
  ) {
    super();
  }

  static async buildFromDevice(device: Device): Promise<LibUsbTransport> {
    const minimimalDeviceInfo = await LibUsbTransport.calculateMinimalDeviceInfo(device);

    return new LibUsbTransport(device, minimimalDeviceInfo);
  }

  static async calculateMinimalDeviceInfo(device: Device): Promise<MinimalDeviceInfo> {
    if (isDeviceOpen(device)) {
      const desc = device.deviceDescriptor;

      const [manufacturer, product, serialNumber] = (await Promise.all([
        promisify((cb) => device.getStringDescriptor(desc.iManufacturer, cb))(),
        promisify((cb) => device.getStringDescriptor(desc.iProduct, cb))(),
        promisify((cb) => device.getStringDescriptor(desc.iSerialNumber, cb))(),
      ])) as string[];

      return {
        vendorId: desc.idVendor,
        productId: desc.idProduct,
        release: desc.bcdDevice,
        manufacturer,
        product,
        serialNumber,
      };
    } else {
      try {
        device.open();
        return await LibUsbTransport.calculateMinimalDeviceInfo(device);
      } finally {
        device.close();
      }
    }
  }

  async sendFeatureReport(data: Buffer | number[]): Promise<number> {
    const buffer = Buffer.from(data);
    const reportId = buffer[0]; // HID reports start with reportId
    const reportData = buffer.subarray(1);

    const ret = await new Promise<Buffer | number | undefined>((resolve, reject) => {
      this.device.controlTransfer(
        0x21, // bmRequestType: Host to device | Class | Interface
        0x09, // bRequest: SET_REPORT
        (3 << 8) | reportId, // wValue: (3=Feature) << 8 | reportId
        this.wIndex, // wIndex: interface number
        reportData,
        (err, b) => (err ? reject(err) : resolve(b)),
      );
    });
    if (typeof ret === 'number') {
      return ret; // If the return type is a number, return it directly
    }
    return ret!.length;
  }

  async getFeatureReport(reportId: number, reportLength: number): Promise<Buffer> {
    const ret = await new Promise((resolve, reject) => {
      this.device.controlTransfer(
        0xa1, // bmRequestType: Device to host | Class | Interface
        0x01, // bRequest: GET_REPORT
        (3 << 8) | reportId, // wValue: (3=Feature) << 8 | reportId
        this.wIndex, // wIndex: interface number
        reportLength,
        (err, data) => (err ? reject(err) : resolve(data)),
      );
    });
    if (!Buffer.isBuffer(ret)) {
      throw Object.assign(new Error('Expected a Buffer from getFeatureReport'), {
        returnValue: ret,
      });
    }
    return ret;
  }

  getDeviceInfo(): MinimalDeviceInfo {
    return this.minimalDeviceInfo;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.device.interfaces?.forEach((iface) => {
          if (iface.isKernelDriverActive()) {
            iface.detachKernelDriver();
          }
          iface.release(true, () => {}); // release w/ callback to avoid warning
        });
        this.device.close();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
