# openclaw-watchdog

A lightweight Node.js watchdog for OpenClaw.

It checks gateway health on an interval, attempts recovery (`restart -> rollback`), and sends notifications to Telegram / Discord / WhatsApp-compatible webhooks.

## Features

- Health check (`/health` endpoint)
- Auto-restart command
- Built-in cross-platform rollback command (`node src/cli/index.js rollback --auto`)
- Optional custom rollback command override
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

## Config

Generated `.env` fields:

- `CLAW_NAME` (display name used in notifications)
- `PROJECT_DIR` (auto-written by `init`, used by service install)
- `OPENCLAW_CONFIG_PATH` (optional explicit path to `openclaw.json`)
- `HEALTH_URL`
- `CHECK_INTERVAL_MS`
- `FAIL_THRESHOLD`
- `ROLLBACK_THRESHOLD` (only rollback after this many consecutive failures)
- `AUTO_RESTART`
- `RESTART_COMMAND`
- `AUTO_ROLLBACK`
- `ROLLBACK_COMMAND` (`internal` by default; recommended for service mode)
- `NOTIFIER` = `telegram|discord|whatsapp|none`

Notifier-specific fields:

- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Discord: `DISCORD_WEBHOOK_URL`
- WhatsApp webhook: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN` (optional)

## Run as a persistent service

You usually do **not** need manual service setup anymore.

### Recommended (automatic)

Use init and choose service action when prompted:

```bash
npm run init
```

Or run direct commands:

```bash
npm run service:install
npm run service:uninstall
```

The CLI auto-detects your OS and installs/removes the correct service type.

## One-command service management

You can also let the CLI auto-detect OS and manage persistence:

```bash
npm run service:install
npm run service:uninstall
```

During `npm run init`, you can choose:
- Do nothing
- Install service
- Uninstall service

## Service operations reference (install / uninstall / restart)

### macOS (launchd)

Install/load:

```bash
launchctl load -w ~/Library/LaunchAgents/com.openclaw.watchdog.plist
launchctl start com.openclaw.watchdog
```

Restart:

```bash
launchctl stop com.openclaw.watchdog
launchctl start com.openclaw.watchdog
```

Uninstall/unload:

```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.watchdog.plist
rm -f ~/Library/LaunchAgents/com.openclaw.watchdog.plist
```

### Linux (systemd --user)

Install/enable:

```bash
systemctl --user daemon-reload
systemctl --user enable --now openclaw-watchdog
```

Restart:

```bash
systemctl --user restart openclaw-watchdog
```

Uninstall/disable:

```bash
systemctl --user disable --now openclaw-watchdog
rm -f ~/.config/systemd/user/openclaw-watchdog.service
systemctl --user daemon-reload
```

### Windows (Task Scheduler)

Install:

```powershell
.\deploy\windows\install-task.ps1 -ProjectDir "C:\path\to\openclaw-watchdog"
```

Notes:
- Installer auto-detects `node.exe` from PATH.
- If Node.js is missing, it exits with an install hint.
- If PowerShell runtime is unavailable, it exits with a clear error.

Restart:

```powershell
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
```

Uninstall:

```powershell
.\deploy\windows\uninstall-task.ps1
```

## Cross-platform helper

Run:

```bash
npm run doctor
```

This prints OS-specific setup guidance and template locations.

## License

MIT
