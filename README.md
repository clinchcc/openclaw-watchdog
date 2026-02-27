# openclaw-watchdog

A lightweight Node.js watchdog for OpenClaw.

It checks gateway health on an interval, attempts recovery (`restart -> rollback`), and sends notifications to Telegram / Discord / WhatsApp-compatible webhooks.

## Features

- Health check (`/health` endpoint)
- Auto-restart command
- Optional auto-rollback command
- Notification providers:
  - Telegram Bot API
  - Discord Webhook
  - Generic WhatsApp webhook (provider-agnostic)
- Interactive setup: `oc-watchdog init`
- English-first UX and docs

## Quick Start

```bash
npm install
npm run init
npm start
```

Or directly:

```bash
npx oc-watchdog init
npx oc-watchdog run
```

## Config

Generated `.env` fields:

- `HEALTH_URL`
- `CHECK_INTERVAL_MS`
- `FAIL_THRESHOLD`
- `AUTO_RESTART`
- `RESTART_COMMAND`
- `AUTO_ROLLBACK`
- `ROLLBACK_COMMAND`
- `NOTIFIER` = `telegram|discord|whatsapp|none`

Notifier-specific fields:

- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Discord: `DISCORD_WEBHOOK_URL`
- WhatsApp webhook: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN` (optional)

## Example service mode

Use your OS service manager to keep it running (`systemd`, `launchd`, Docker, PM2).

## License

MIT
