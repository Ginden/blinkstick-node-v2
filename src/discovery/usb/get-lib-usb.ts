/**
 * This will `require` the `usb` library dynamically.
 * If you don't have it installed, you will get an error when you try to use this function.
 */
export function getLibUsb(): typeof import('usb') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('usb');
}
