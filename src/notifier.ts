import { Client, GatewayIntentBits, TextChannel } from "discord.js";

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

    this.client.once("clientReady", () => {
      this.ready = true;
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.login(token).catch((err) => {
      console.error("Failed to login to Discord:", err);
      process.exit(1);
    });
  }

  async notify(): Promise<void> {
    if (!this.ready) return;

    const now = Date.now();
    if (now - this.lastNotification < this.cooldownMs) return;

    try {
      const channel = (await this.client.channels.fetch(
        this.channelId,
      )) as TextChannel | null;
      if (!channel) {
        console.error("Channel not found");
        return;
      }
      const lines = [
        "Match found! Your team is already feeding mid. Go accept!",
        "Game's ready. Try not to pick Pudge this time.",
        "A match! Quick, before someone dodges and you wait another 10 minutes.",
        "Stop touching grass. Match is ready.",
        "Your teammates are statistically average at best. Accept before they replace you.",
      ];
      const msg = `<@${this.userId}> ${lines[Math.floor(Math.random() * lines.length)]}`;
      await channel.send(msg);
      this.lastNotification = now;
      console.log("Notification sent");
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  }

  async destroy(): Promise<void> {
    this.client.destroy();
  }
}
