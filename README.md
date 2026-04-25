# Dota 2 Match Notifier

Discord bot that watches your screen for the Dota 2 "ACCEPT" button and pings you when a match is found — so you can be AFK without missing games.

## How it works

1. Takes a screenshot of a configurable screen region every 3 seconds
2. Compares pixels against a reference image of the ACCEPT button
3. If they match (≥85% similarity), sends an @mention to a Discord channel
4. Enters a 60s cooldown to avoid spam while the button is still visible

## Setup

### 1. Install

```sh
npm install
```

### 2. Create a Discord bot

- https://discord.com/developers/applications → New Application
- **Bot** tab → Reset Token → copy it
- **OAuth2** → URL Generator → check `bot` scope + `Send Messages` permission
- Open the generated URL to invite the bot to your server
- Enable **Developer Mode** in Discord: Settings → Advanced → toggle on
- Right-click your username → Copy ID
- Right-click the target channel → Copy ID

### 3. Configure

Copy `.env.example` to `.env` and fill in:

```
DISCORD_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id
DISCORD_USER_ID=your_user_id
```

Edit `config.json`:

```json
{
  "displayIndex": 0,
  "region": { "x": 768, "y": 478, "width": 1045, "height": 360 },
  "threshold": 0.85,
  "pollIntervalMs": 3000,
  "cooldownMs": 60000
}
```

| Setting | Description |
|---------|-------------|
| `displayIndex` | `0` for primary monitor, `1` for secondary |
| `region` | Pixel coordinates of the ACCEPT button area (relative to that display) |
| `threshold` | Similarity ratio to trigger (0–1) |
| `pollIntervalMs` | How often to check (ms) |
| `cooldownMs` | Minimum time between notifications (ms) |

### 4. Create a reference image

- Wait for a match to pop up in Dota 2 (or use demo mode)
- Screenshot just the ACCEPT button region
- Save as `src/reference.png`
- **The image dimensions must exactly match** `region.width` × `region.height` in `config.json`

> **Tip:** Use Win+Shift+S to select the button, then check dimensions in MS Paint.

### 5. Run

```sh
npm run dev
```

Press `Ctrl+C` to stop.

## Requirements

- Windows (uses PowerShell for screen capture)
- Node.js ≥ 18
- A Discord server where you can add bots
