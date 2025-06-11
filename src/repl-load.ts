import * as blinkstick from './index';
import { asBuffer } from './utils';

const globalScopeAdditions = {
  blinkstick,
  b: blinkstick,
  findFirst: blinkstick.findFirst,
  findFirstAsync: blinkstick.findFirstAsync,
  findAll: blinkstick.findBlinkSticks,
  findBlinkSticks: blinkstick.findBlinkSticks,
  findBlinkSticksAsync: blinkstick.findBlinkSticksAsync,
  findAllAsync: blinkstick.findBlinkSticksAsync,
  AnimationBuilder: blinkstick.AnimationBuilder,
  asBuffer: asBuffer,
};

Object.assign(global, globalScopeAdditions);

const availableDevices: Record<string, blinkstick.BlinkStick> = {};

let i = 0;

for (const device of blinkstick.findBlinkSticks()) {
  let name = (device.deviceDescription?.name || 'BlinkStick Unknown')
    .replace(/\s+/g, '_')
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  name = name.charAt(0).toLowerCase() + name.slice(1);
  if (availableDevices[name]) {
    name += `${++i}`;
  }
  availableDevices[name] = device;
}

Object.assign(global, availableDevices);

console.log('Loaded BlinkStick library into global scope.');

console.log(
  `Your devices are available in global scope as ${Object.keys(availableDevices).join(', ')}`,
);
