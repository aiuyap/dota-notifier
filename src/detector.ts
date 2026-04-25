import sharp from 'sharp';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { log } from './logger.js';

const TOLERANCE = 30;

export class Detector {
  private reference: Buffer | null = null;
  private totalPixels: number = 0;

  async loadReference(
    regionWidth: number,
    regionHeight: number,
  ): Promise<void> {
    const refPath = resolve(process.cwd(), 'src', 'reference.png');
    if (!existsSync(refPath)) {
      log.fatal('src/reference.png not found');
    }

    const metadata = await sharp(refPath).metadata();
    if (!metadata.width || !metadata.height) {
      log.fatal('Could not read reference image dimensions');
    }

    if (
      metadata.width !== regionWidth ||
      metadata.height !== regionHeight
    ) {
      log.fatal(
        `Reference image dimensions (${metadata.width}x${metadata.height}) ` +
          `do not match configured region dimensions (${regionWidth}x${regionHeight})`,
      );
    }

    this.totalPixels = metadata.width * metadata.height;
    this.reference = await sharp(refPath).ensureAlpha().raw().toBuffer();
    log.success(
      `Reference loaded: ${metadata.width}x${metadata.height} (${this.totalPixels} pixels)`,
    );
  }

  compare(captureBuffer: Buffer): number {
    if (!this.reference) {
      throw new Error('Reference not loaded');
    }

    let matching = 0;
    const totalBytes = this.totalPixels * 4;

    for (let i = 0; i < totalBytes; i += 4) {
      const dr = Math.abs(this.reference[i] - captureBuffer[i]);
      const dg = Math.abs(this.reference[i + 1] - captureBuffer[i + 1]);
      const db = Math.abs(this.reference[i + 2] - captureBuffer[i + 2]);

      if (dr <= TOLERANCE && dg <= TOLERANCE && db <= TOLERANCE) {
        matching++;
      }
    }

    return matching / this.totalPixels;
  }
}
