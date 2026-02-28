<!-- Language Toggle -->
<div align="right">
  <button onclick="toggleLang()" style="padding:8px 16px;cursor:pointer;">🇨🇳 中文</button>
</div>

---

<!-- English Section -->
<div id="en">

# openclaw-watchdog

A lightweight Node.js watchdog for OpenClaw.

It checks gateway health on an interval, attempts recovery (`restart -> rollback`), and sends notifications to Telegram / Discord / WhatsApp / Feishu webhooks.

## Features

- Health check (`/health` endpoint)
- Auto-restart on failure
- Built-in rollback after consecutive restart failures (configurable threshold)
- Configurable notification intervals (e.g., hourly healthy check-ins)
- Quiet hours support (no notifications during sleep time)
- Notification providers:
  - Telegram Bot API
  - Discord Webhook
  - Generic WhatsApp webhook (provider-agnostic)
  - Feishu Webhook
- Interactive setup: `npm run init`

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
- `FAIL_THRESHOLD` (consecutive failures before restart)
- `ROLLBACK_THRESHOLD` (consecutive restart failures before rollback)
- `AUTO_RESTART`
- `RESTART_COMMAND`
- `AUTO_ROLLBACK`
- `ROLLBACK_COMMAND` (`internal` by default; recommended for service mode)
- `NOTIFY_INTERVAL_MS` (healthy notification interval, default: 3600000 = 1 hour, 0 = disabled)
- `QUIET_HOURS_START` (hour 0-23, default: 23)
- `QUIET_HOURS_END` (hour 0-23, default: 10)
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`

Notifier-specific fields:

- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Discord: `DISCORD_WEBHOOK_URL`
- WhatsApp webhook: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN` (optional)
- Feishu: `FEISHU_WEBHOOK_URL`

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

Restart:

```powershell
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
```

Uninstall:

```powershell
.\deploy\windows\uninstall-task.ps1
```

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

## License

MIT

</div>

---

<!-- 中文 Section -->
<div id="zh" style="display:none;">

# openclaw-watchdog

OpenClaw 轻量级看门狗。

定时检查网关健康状态，尝试恢复（重启 → 回滚），并通过 Telegram / Discord / WhatsApp / 飞书发送通知。

## 功能特点

- 健康检查 (`/health` 端点)
- 失败后自动重启
- 连续重启失败后自动回滚（阈值可配置）
- 可配置通知间隔（如每小时健康签到）
- 静音时段支持（睡眠时间不打扰）
- 通知渠道：
  - Telegram Bot API
  - Discord Webhook
  - 通用 WhatsApp Webhook
  - 飞书 Webhook
- 交互式配置：`npm run init`

## 快速开始

```bash
npm install
npm run init
npm start
```

## 配置项

生成的 `.env` 字段：

- `CLAW_NAME`（通知显示名称）
- `PROJECT_DIR`（init 自动写入，服务安装路径）
- `OPENCLAW_CONFIG_PATH`（可选，显式指定 openclaw.json 路径）
- `HEALTH_URL`
- `CHECK_INTERVAL_MS`
- `FAIL_THRESHOLD`（连续失败次数触发重启）
- `ROLLBACK_THRESHOLD`（连续重启失败次数触发回滚）
- `AUTO_RESTART`
- `RESTART_COMMAND`
- `AUTO_ROLLBACK`
- `ROLLBACK_COMMAND`（默认 `internal`，推荐服务模式使用）
- `NOTIFY_INTERVAL_MS`（健康通知间隔，默认 3600000 = 1 小时，0 = 禁用）
- `QUIET_HOURS_START`（小时 0-23，默认 23）
- `QUIET_HOURS_END`（小时 0-23，默认 10）
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`

各通知渠道专属字段：

- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Discord: `DISCORD_WEBHOOK_URL`
- WhatsApp webhook: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN`（可选）
- 飞书: `FEISHU_WEBHOOK_URL`

## 常驻服务

通常**不需要**手动配置服务。

### 推荐（自动）

init 时选择服务操作：

```bash
npm run init
```

或直接命令：

```bash
npm run service:install
npm run service:uninstall
```

CLI 会自动检测系统并安装/卸载对应服务类型。

## 服务操作参考（安装 / 卸载 / 重启）

### macOS (launchd)

安装/启动：

```bash
launchctl load -w ~/Library/LaunchAgents/com.openclaw.watchdog.plist
launchctl start com.openclaw.watchdog
```

重启：

```bash
launchctl stop com.openclaw.watchdog
launchctl start com.openclaw.watchdog
```

卸载：

```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.watchdog.plist
rm -f ~/Library/LaunchAgents/com.openclaw.watchdog.plist
```

### Linux (systemd --user)

安装/启用：

```bash
systemctl --user daemon-reload
systemctl --user enable --now openclaw-watchdog
```

重启：

```bash
systemctl --user restart openclaw-watchdog
```

卸载：

```bash
systemctl --user disable --now openclaw-watchdog
rm -f ~/.config/systemd/user/openclaw-watchdog.service
systemctl --user daemon-reload
```

### Windows (任务计划程序)

安装：

```powershell
.\deploy\windows\install-task.ps1 -ProjectDir "C:\path\to\openclaw-watchdog"
```

重启：

```powershell
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
```

卸载：

```powershell
.\deploy\windows\uninstall-task.ps1
```

## 一键服务管理

CLI 自动检测系统并管理常驻：

```bash
npm run service:install
npm run service:uninstall
```

`npm run init` 时可选择：
- 不做任何事
- 安装服务
- 卸载服务

## License

MIT

</div>

---

<script>
function toggleLang() {
  var en = document.getElementById('en');
  var zh = document.getElementById('zh');
  if (en.style.display === 'none') {
    en.style.display = 'block';
    zh.style.display = 'none';
  } else {
    en.style.display = 'none';
    zh.style.display = 'block';
  }
}
</script>
