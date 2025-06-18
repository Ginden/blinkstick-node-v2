export const UsbTransport = {
  usb: 'usb',
  hid: 'node-hid',
} as const;

export type UsbTransport = (typeof UsbTransport)[keyof typeof UsbTransport];
