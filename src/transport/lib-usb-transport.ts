import { MinimalDeviceInfo, UsbTransport } from './usb-transport';
import type { Device } from 'usb';
import { promisify } from 'node:util';
import { assert } from 'tsafe';
import { asBuffer } from '../utils';

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

    const iface = device.interfaces?.[0];
    assert(iface, 'Device must have at least one interface');
    if (iface.isKernelDriverActive()) {
      iface.detachKernelDriver();
    }
    iface.claim();

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
    const buffer = asBuffer(data);
    const reportId = buffer[0]; // HID reports start with reportId

    const bmRequestType = 0x20;
    const wValue = (3 << 8) | reportId; // 3 = Feature report type

    const ret = await new Promise<Buffer | number | undefined>((resolve, reject) => {
      this.device.controlTransfer(
        bmRequestType, // bmRequestType: Host to device | Class | Interface
        0x09, // bRequest: SET_REPORT
        wValue, // wValue: (3=Feature) << 8 | reportId
        this.wIndex, // wIndex: interface number
        buffer,
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
