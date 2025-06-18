export function getLibUsb(): typeof import('usb') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('usb');
}
