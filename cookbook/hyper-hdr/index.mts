import { findBlinkSticksAsync, type RgbTuple } from '@ginden/blinkstick-v2';
import * as dgram from 'node:dgram';

const startPortUdp = 19444;

const blinkStickDevices = await findBlinkSticksAsync();

for (const [i, device] of blinkStickDevices.entries()) {
  const id = await device.id.getOrCreateId();
  try {
    const deviceDescription = device.deviceDescription;

    if (
      deviceDescription &&
      'variableLedCount' in device.deviceDescription &&
      device.deviceDescription.variableLedCount
    ) {
      // Load LED count to be able to control LEDs for Flex/Pro
      await device.loadLedCountFromDevice();
    }
  } catch (e) {
    console.warn(`[Warning] Failed to load LED count for device ID ${id}:`, e);
  }
  const socket = dgram.createSocket('udp4');
  socket.bind(startPortUdp + i);
  socket.on(`listening`, () => {
    console.log(`Device with ID ${id} is listening on 127.0.0.1:${startPortUdp + i}`);
  });
  socket.on('message', (msg, rinfo) => {
    console.log(
      `Device ID: ${id} received: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`,
    );
    if (msg.length === 3) {
      // Set all LEDs to the same color, because you configured HyperHDR to send only 3 bytes (1 RGB color)
      void device.leds().setColor(Array.from(msg) as RgbTuple);
    } else if (msg.length % 3 === 0) {
      void device.setColors(0, msg);
    }
  });
}
