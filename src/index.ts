export * from './discovery/node-hid';
/**
 * @summary `libusb` based discovery module for BlinkStick devices.
 * @module Discovery
 * @namespace usb
 */
export * as usb from './discovery/usb';
/**
 * @summary `node-hid` based discovery module for BlinkStick devices.
 * @module Discovery
 * @namespace nodeHid
 */
export * as nodeHid from './discovery/node-hid';
export * from './discovery/discovery-filter';
export * from './core';
export * from './consts/consts';
export * from './consts/color-keywords';
export * from './types';
export * from './consts/device-descriptions';
export * from './color-change-options';
/**
 * @module animations
 */
export * from './animations';
/**
 * @module led
 */
export * from './led';
export * from './utils/colors/get-random-color';
export * from './utils/colors/color-input-to-rgb-tuple';
export * from './utils/colors/color-input-to-rgb-tuple';
export * from './transport';
