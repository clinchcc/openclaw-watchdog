# openclaw-watchdog

**English** | [中文](#中文)

---

## English

A lightweight Node.js watchdog for OpenClaw.

It checks gateway health on an interval, attempts recovery (`restart -> rollback`), and sends notifications to Telegram / Discord / WhatsApp / Feishu webhooks.

### Features

- Health check (`/health` endpoint)
- Auto-restart on failure
- Built-in rollback after consecutive restart failures (configurable threshold)
- Configurable notification intervals (e.g., hourly healthy check-ins)
- Quiet hours support (no notifications during sleep time)
- Notification providers: Telegram, Discord, WhatsApp, Feishu
- Interactive setup: `npm run init`

### Quick Start

```bash
npm install
npm run init
npm start
```

### Config

- `CLAW_NAME` - display name in notifications
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`
- `NOTIFY_INTERVAL_MS` - healthy notification interval (default: 3600000 = 1 hour)
- `QUIET_HOURS_START/END` - quiet hours (default: 23-10)
- And more...

### Service Commands

```bash
npm run service:install   # Install as system service
npm run service:uninstall # Remove service
```

---

# openclaw-watchdog

**英文** | 中文

---

轻量级 Node.js 看门狗，专为 OpenClaw 设计。

定时检查网关健康状态，尝试恢复（重启 → 回滚），并通过 Telegram / Discord / WhatsApp / 飞书发送通知。

### 功能特点

- 健康检查 (`/health` 端点)
- 失败后自动重启
- 连续重启失败后自动回滚（阈值可配置）
- 可配置通知间隔（如每小时健康签到）
- 静音时段支持（睡眠时间不打扰）
- 通知渠道：Telegram、Discord、WhatsApp、飞书
- 交互式配置：`npm run init`

### 快速开始

```bash
npm install
npm run init
npm start
```

### 配置项

- `CLAW_NAME` - 通知显示名称
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`
- `NOTIFY_INTERVAL_MS` - 健康通知间隔（默认 3600000 = 1 小时）
- `QUIET_HOURS_START/END` - 静音时段（默认 23-10）
- 更多...

### 服务命令

```bash
npm run service:install   # 安装为系统服务
npm run service:uninstall # 卸载服务
```
