import { loadConfig } from './config.js';
import { listDisplays, captureRegion } from './capture.js';
import { Detector } from './detector.js';
import { Notifier } from './notifier.js';
import { log } from './logger.js';

async function main() {
  log.banner();

  const config = loadConfig();
  log.info(
    `Region: ${config.region.width}x${config.region.height} at (${config.region.x}, ${config.region.y})`,
  );

  const displays = await listDisplays();
  log.info(`Found ${displays.length} display(s):`);
  displays.forEach((d: { name: string }, i: number) => log.info(`  [${i}] ${d.name}`));

  if (config.displayIndex >= displays.length) {
    log.fatal(
      `displayIndex ${config.displayIndex} is out of range (max ${displays.length - 1})`,
    );
  }
  log.info(`Using display [${config.displayIndex}]: ${displays[config.displayIndex].name}`);

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
    log.warn('Shutting down...');
    running = false;
    await notifier.destroy();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Allow Discord client time to connect
  await new Promise((r) => setTimeout(r, 2000));

  log.info(
    `Polling every ${config.pollIntervalMs}ms | threshold: ${(config.threshold * 100).toFixed(0)}% | cooldown: ${config.cooldownMs}ms`,
  );

  while (running) {
    const start = Date.now();

    try {
      const pixels = await captureRegion(config.displayIndex, config.region);
      const similarity = detector.compare(pixels);

      const percent = (similarity * 100).toFixed(1);
      log.status(`similarity: ${percent}%`);

      if (similarity >= config.threshold) {
        log.statusClear();
        log.success(`Match detected! (${percent}%)`);
        await notifier.notify();
      }
    } catch (err) {
      log.statusClear();
      log.error(`Poll error: ${err}`);
    }

    const elapsed = Date.now() - start;
    const delay = Math.max(0, config.pollIntervalMs - elapsed);
    await new Promise((r) => setTimeout(r, delay));
  }
}

main().catch((err) => {
  log.fatal(`Fatal error: ${err}`);
});
