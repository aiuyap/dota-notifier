import { loadConfig } from './config.js';
import { listDisplays, captureRegion } from './capture.js';
import { Detector } from './detector.js';
import { Notifier } from './notifier.js';

async function main() {
  console.log('Dota 2 Match Notifier starting...\n');

  const config = loadConfig();
  console.log('Region:', `${config.region.width}x${config.region.height} at (${config.region.x}, ${config.region.y})`);

  const displays = await listDisplays();
  console.log(`\nFound ${displays.length} display(s):`);
  displays.forEach((d: { name: string }, i: number) => console.log(`  [${i}] ${d.name}`));

  if (config.displayIndex >= displays.length) {
    console.error(
      `\ndisplayIndex ${config.displayIndex} is out of range (max ${displays.length - 1})`,
    );
    process.exit(1);
  }
  console.log(`Using display [${config.displayIndex}]: ${displays[config.displayIndex].name}`);

  const detector = new Detector();
  await detector.loadReference(config.region.width, config.region.height);

  const notifier = new Notifier(
    config.discordToken,
    config.discordChannelId,
    config.discordUserId,
    config.cooldownMs,
  );

  let running = true;
  const shutdown = async () => {
    console.log('\nShutting down...');
    running = false;
    await notifier.destroy();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Allow Discord client time to connect
  await new Promise((r) => setTimeout(r, 2000));

  console.log(
    `\nPolling every ${config.pollIntervalMs}ms | threshold: ${(config.threshold * 100).toFixed(0)}% | cooldown: ${config.cooldownMs}ms\n`,
  );

  while (running) {
    const start = Date.now();

    try {
      const pixels = await captureRegion(config.displayIndex, config.region);
      const similarity = detector.compare(pixels);

      const percent = (similarity * 100).toFixed(1);
      process.stdout.write(`  similarity: ${percent}%  \r`);

      if (similarity >= config.threshold) {
        console.log(`\nMatch detected! (${percent}%)`);
        await notifier.notify();
      }
    } catch (err) {
      console.error('\nPoll error:', err);
    }

    const elapsed = Date.now() - start;
    const delay = Math.max(0, config.pollIntervalMs - elapsed);
    await new Promise((r) => setTimeout(r, delay));
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
