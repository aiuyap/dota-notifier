# Dota 2 Match Notifier — Plan

A Discord bot that monitors a specific screen region for the Dota 2 "ACCEPT" button and sends a Discord notification via @mention when a match is found.

---

## Architecture

```
                    ┌──────────────┐
                    │   config.json │  displayIndex, region, threshold, userId
                    │   .env        │  DISCORD_TOKEN, DISCORD_CHANNEL_ID
                    └──────┬───────┘
                           │
┌──────────┐    ┌──────────▼──────┐    ┌─────────────┐    ┌──────────────┐
│ List     │    │  Poll Loop      │    │  Detector   │    │  Discord     │
│ Displays │───▶│  (every 3s)     │───▶│  (pixel cmp)│───▶│  (@mention)  │
│ pick idx │    │                 │    │             │    │  + cooldown  │
└──────────┘    │  Capture 1 disp │    │  sharp      │    │  discord.js  │
                │  Crop to region │    │  similarity │    └──────────────┘
                └─────────────────┘    └─────────────┘
```

## File Structure

```
dota-notifier/
├── src/
│   ├── index.ts              # Main: init, poll loop, graceful shutdown
│   ├── config.ts             # Load & validate config.json + .env
│   ├── capture.ts            # Screenshot specific display, crop with sharp
│   ├── detector.ts           # Load reference.png, compare pixel buffers
│   ├── notifier.ts           # Discord client, send @mention, cooldown
│   └── reference.png         # ACCEPT button screenshot (user provides)
├── config.json               # Non-secret settings
├── .env                       # DISCORD_TOKEN, DISCORD_CHANNEL_ID
├── package.json
└── tsconfig.json
```

## Dependencies

| Package | Role |
|---------|------|
| `discord.js` | Discord gateway + API |
| `screenshot-desktop` | Cross-platform screen capture |
| `sharp` | Crop region + extract raw pixels |
| `dotenv` | `.env` loading |
| `tsx` | Run TypeScript directly |

## Config Schema

```json
// config.json
{
  "displayIndex": 0,
  "region": { "x": 1200, "y": 900, "width": 280, "height": 80 },
  "threshold": 0.85,
  "pollIntervalMs": 3000,
  "cooldownMs": 60000,
  "discordUserId": "YOUR_DISCORD_USER_ID"
}
```

```
# .env
DISCORD_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id
```

- **displayIndex** — `0` for primary/first monitor, `1` for secondary. Only one display is captured per poll.
- **region** — Pixel coordinates relative to the chosen display's top-left corner (0,0). The ACCEPT button region.
- **threshold** — Similarity ratio (0–1). Pixel comparison must meet or exceed this to trigger notification.
- **pollIntervalMs** — How often to capture and check (ms).
- **cooldownMs** — Minimum time between notifications to prevent spam while the button is still visible.
- **discordUserId** — Your Discord user ID (for @mention).
- **DISCORD_TOKEN** — Discord bot token (from Discord Developer Portal).
- **DISCORD_CHANNEL_ID** — Discord channel ID where notifications will be posted.

## Detection Logic

1. Load `reference.png` at startup → extract raw RGBA pixel buffer via `sharp`
2. Each poll cycle:
   - Capture the configured display via `screenshot-desktop`
   - Crop to the configured region via `sharp`
   - Resize crop to match reference dimensions (handles minor coordinate drift)
   - Extract raw RGBA pixel buffer
   - Compare pixel-by-pixel: count pixels where R, G, B channel differences are all within a tolerance of 30
   - `similarity = matchingPixels / totalPixels`
3. If `similarity >= threshold` → match detected

Using per-channel tolerance (±30 in each RGB) rather than exact match handles:
- Minor rendering variations (AA, driver differences)
- Gamma / colour profile differences
- Time of day lighting
- Slight GPU differences

## Notification Flow

1. Match detected → check cooldown timer
2. If not in cooldown → send message to configured Discord channel:
   > <@discordUserId> Match found! Accept it now!
3. Start cooldown timer (default 60s)
4. During cooldown, matches are ignored
5. After cooldown expires, next match triggers a new notification

## Dual Monitor Handling

- `screenshot-desktop` lists all connected displays via `listDisplays()`
- We capture **only one** display per poll (configured via `displayIndex`)
- All coordinates are relative to that display's top-left corner
- At startup, the bot dumps display info and optionally saves a screenshot of each display so the user can confirm which index maps to their main monitor
- 1440p resolution is fully supported by `sharp`

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Match found, button visible ~15s | Cooldown blocks re-notification for 60s |
| Dota 2 not running / alt-tabbed | Detector returns low similarity → no message |
| Dual monitor, Dota on secondary | Change `displayIndex` to `1` |
| Discord disconnected | Auto-reconnect (discord.js built-in) |
| Ctrl+C / process killed | Graceful: destroy Discord client, clear interval |
| Reference region slightly misaligned | Resize to match reference dimensions handles minor drift |
| Display unavailable (monitor off) | Capture fails → log error, skip cycle, retry next poll |

## Setup Checklist

1. Create a Discord bot at https://discord.com/developers/applications
2. Invite bot to your server with "Send Messages" and "Mention Everyone" permissions
3. Enable Developer Mode in Discord → right-click your user → Copy ID
4. Enable Developer Mode → right-click target channel → Copy ID
5. Copy `.env.example` to `.env` and fill in token and channel ID
6. Take a clean screenshot of just the ACCEPT button region on your 1440p monitor
7. Save as `src/reference.png`
8. Measure pixel coordinates (x, y, width, height) of that region on the correct display
9. Fill in `config.json` with your coordinates, Discord user ID, and display index
10. Run `npm install && npm start`
11. Verify: at startup, the bot lists available displays — confirm `displayIndex` is correct
