import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import type { Region } from './config.js';

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 10 * 1024 * 1024;

interface Display {
  name: string;
}

export async function listDisplays(): Promise<Display[]> {
  const { stdout } = await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Add-Type -AssemblyName System.Windows.Forms; ' +
        '[System.Windows.Forms.Screen]::AllScreens | ForEach-Object { $_.DeviceName }',
    ],
    { maxBuffer: MAX_BUFFER },
  );

  return stdout
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((name) => ({ name: name.trim() }));
}

function buildScreenScript(displayIndex: number, region: Region): string {
  return [
    'Add-Type -AssemblyName System.Drawing, System.Windows.Forms',
    `$s=[System.Windows.Forms.Screen]::AllScreens`,
    `$scr=$s[${displayIndex}]`,
    `$bmp=New-Object System.Drawing.Bitmap(${region.width},${region.height})`,
    `$g=[System.Drawing.Graphics]::FromImage($bmp)`,
    `$g.CopyFromScreen(($scr.Bounds.Left+${region.x}),($scr.Bounds.Top+${region.y}),0,0,(New-Object System.Drawing.Size(${region.width},${region.height})))`,
    `$g.Dispose()`,
    `$ms=New-Object System.IO.MemoryStream`,
    `$bmp.Save($ms,[System.Drawing.Imaging.ImageFormat]::Png)`,
    `$bmp.Dispose()`,
    `[Convert]::ToBase64String($ms.ToArray())`,
    `$ms.Dispose()`,
  ].join('; ');
}

export async function captureRegion(
  displayIndex: number,
  region: Region,
): Promise<Buffer> {
  const displays = await listDisplays();
  if (displayIndex >= displays.length) {
    throw new Error(
      `Display index ${displayIndex} out of range (found ${displays.length} displays)`,
    );
  }

  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', buildScreenScript(displayIndex, region)],
    { maxBuffer: MAX_BUFFER },
  );

  const pngBuffer = Buffer.from(stdout.trim(), 'base64');

  return sharp(pngBuffer).ensureAlpha().raw().toBuffer();
}
