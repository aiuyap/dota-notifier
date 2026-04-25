import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import type { Region } from './config.js';

export async function listDisplays() {
  return screenshot.listDisplays();
}

export async function captureRegion(
  displayIndex: number,
  region: Region,
): Promise<Buffer> {
  const displays = await screenshot.listDisplays();
  if (displayIndex >= displays.length) {
    throw new Error(
      `Display index ${displayIndex} out of range (found ${displays.length} displays)`,
    );
  }

  const display = displays[displayIndex];
  const imgBuffer = await screenshot({ screen: display.id });

  const rawPixels = await sharp(imgBuffer)
    .extract({
      left: region.x,
      top: region.y,
      width: region.width,
      height: region.height,
    })
    .ensureAlpha()
    .raw()
    .toBuffer();

  return rawPixels;
}
