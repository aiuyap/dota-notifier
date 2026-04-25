import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

export class Notifier {
  private client: Client;
  private channelId: string;
  private userId: string;
  private cooldownMs: number;
  private lastNotification: number = 0;
  private ready: boolean = false;

  constructor(
    token: string,
    channelId: string,
    userId: string,
    cooldownMs: number,
  ) {
    this.channelId = channelId;
    this.userId = userId;
    this.cooldownMs = cooldownMs;

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    this.client.once('ready', () => {
      this.ready = true;
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.login(token).catch((err) => {
      console.error('Failed to login to Discord:', err);
      process.exit(1);
    });
  }

  async notify(): Promise<void> {
    if (!this.ready) return;

    const now = Date.now();
    if (now - this.lastNotification < this.cooldownMs) return;

    this.lastNotification = now;

    try {
      const channel = (await this.client.channels.fetch(this.channelId)) as TextChannel | null;
      if (!channel) {
        console.error('Channel not found');
        return;
      }
      await channel.send(
        `<@${this.userId}> Match found! Accept it now!`,
      );
      console.log('Notification sent');
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }

  async destroy(): Promise<void> {
    this.client.destroy();
  }
}
