import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { log } from './logger.js';

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Config {
  displayIndex: number;
  region: Region;
  threshold: number;
  pollIntervalMs: number;
  cooldownMs: number;
  discordUserId: string;
  discordToken: string;
  discordChannelId: string;
}

export function loadConfig(): Config {
  const configPath = resolve(process.cwd(), 'config.json');
  if (!existsSync(configPath)) log.fatal('config.json not found');

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch {
    log.fatal('config.json is not valid JSON');
  }

  const discordToken = process.env.DISCORD_TOKEN;
  const discordChannelId = process.env.DISCORD_CHANNEL_ID;
  const discordUserId = process.env.DISCORD_USER_ID;

  if (!discordToken) log.fatal('DISCORD_TOKEN not set in .env');
  if (!discordChannelId) log.fatal('DISCORD_CHANNEL_ID not set in .env');
  if (!discordUserId) log.fatal('DISCORD_USER_ID not set in .env');

  if (typeof raw.displayIndex !== 'number' || raw.displayIndex < 0) {
    log.fatal('config.json: displayIndex must be a non-negative number');
  }

  const region = raw.region as Record<string, unknown> | undefined;
  if (
    !region ||
    typeof region.x !== 'number' ||
    typeof region.y !== 'number' ||
    typeof region.width !== 'number' ||
    typeof region.height !== 'number' ||
    region.width <= 0 ||
    region.height <= 0
  ) {
    log.fatal('config.json: region must have valid x, y, width (>0), height (>0)');
  }

  if (typeof raw.threshold !== 'number' || raw.threshold < 0 || raw.threshold > 1) {
    log.fatal('config.json: threshold must be a number between 0 and 1');
  }

  if (typeof raw.pollIntervalMs !== 'number' || raw.pollIntervalMs < 500) {
    log.fatal('config.json: pollIntervalMs must be >= 500');
  }

  if (typeof raw.cooldownMs !== 'number' || raw.cooldownMs < 0) {
    log.fatal('config.json: cooldownMs must be a non-negative number');
  }

  return {
    displayIndex: raw.displayIndex,
    region: { x: region.x, y: region.y, width: region.width, height: region.height },
    threshold: raw.threshold,
    pollIntervalMs: raw.pollIntervalMs,
    cooldownMs: raw.cooldownMs,
    discordUserId,
    discordToken,
    discordChannelId,
  };
}
