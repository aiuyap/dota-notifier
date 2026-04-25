# AGENTS.md

## Run

```sh
npm run dev
```

Uses `tsx` to run TypeScript directly — no compile step.

## Config

- `config.json` — non-secret settings (displayIndex, region, threshold, userId)
- `.env` — secrets only (DISCORD_TOKEN, DISCORD_CHANNEL_ID)

Both are loaded at startup. `.env` is gitignored.

## Dual monitors

`screenshot-desktop` captures one display at a time via `listDisplays()`. The `displayIndex` in `config.json` selects which one. Coordinates in `region` are relative to that display's top-left. Never capture the full combined desktop — only the target display.

## Reference image

`src/reference.png` must be an exact pixel match for the configured `region` dimensions. It is loaded once at startup and compared against every poll cycle using per-channel RGB tolerance (±30), not exact pixel equality.

## Detection

Similarity = matching pixels / total pixels. A pixel "matches" when all three RGB channels differ by ≤ 30 from the reference pixel (alpha ignored). `threshold` in config.json controls the minimum ratio to fire.

## Cooldown

After a match notification, further matches are suppressed for `cooldownMs` (default 60s) to avoid spam while the button remains visible.
