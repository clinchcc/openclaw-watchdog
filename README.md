# openclaw-watchdog

**English** | [中文](#openclaw-watchdog-中文)

---

## <a name="english"></a>English

### What is it?

A watchdog that monitors your OpenClaw gateway 24/7. If it goes down, it automatically recovers and notifies you.

### How it works

1. **Health Check** every 5 minutes (configurable)
2. **If unhealthy 2 times** → auto-restart gateway  
3. **If restart fails** → auto-rollback to last good config
4. **Notify you** via Telegram/Discord/WhatsApp/Feishu at every step (includes backup file paths for debugging)

### Recovery Timeline (default)

| Step | Time | Action |
|------|------|--------|
| 1 | 0 min | Health check fails |
| 2 | 5 min | Health check fails again → restart |
| 3 | ~10 min | Restart fails → rollback to .bak (immediate restart + health check) |
| 4 | ~10.5 min | .bak fails → try .bak.1 (immediate) |
| 5 | ~11 min | .bak.1 fails → try .bak.2 (immediate) |
| ... | ~30s each | Continue until success or all backups exhausted |
| Final | - | If all backups fail → notify you with all tried backups |

*Each backup retry takes ~30 seconds (restart timeout + health check)*

### Install & Run

```bash
npm install
npm run init   # Configure (notifications, intervals, etc)
npm start      # Run in foreground (for testing)
```

### Service Management (All Platforms)

#### Install Service (Auto)

```bash
npm run service:install
```

#### Uninstall Service

```bash
npm run service:uninstall
```

#### Restart Service

```bash
# macOS
launchctl stop com.openclaw.watchdog
launchctl start com.openclaw.watchdog

# Linux
systemctl --user restart openclaw-watchdog

# Windows
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
```

#### Check Status & Logs

```bash
# macOS
launchctl list | grep openclaw.watchdog
tail -30 ~/.openclaw-watchdog/watchdog.out.log

# Linux
systemctl --user status openclaw-watchdog
journalctl --user -u openclaw-watchdog -f

# Windows
Get-ScheduledTaskInfo -TaskName "OpenClawWatchdog"
Get-Content "$env:USERPROFILE\.openclaw-watchdog\watchdog.out.log" -Tail 30
```

#### Test Notifications

```bash
# Manual health check (triggers notification if unhealthy)
npm run check

# Or run in foreground to see all logs
npm start
```

---

## <a name="openclaw-watchdog-中文"></a>openclaw-watchdog

**[English](#english)** | 中文

### 这是什么？

一个 24 小时监控你 OpenClaw 网关的看门狗。如果网关挂了，自动恢复并通知你。

### 工作原理

1. **健康检查** 每 5 分钟（可配置）
2. **连续 2 次失败** → 自动重启网关
3. **重启失败** → 自动回滚到上一个正常配置
4. **每一步都通知** 你（包含备份文件路径，帮你定位问题）

### 恢复时间线（默认）

| 步骤 | 时间 | 操作 |
|------|------|------|
| 1 | 0 分钟 | 健康检查失败 |
| 2 | 5 分钟 | 再次失败 → 重启 |
| 3 | ~10 分钟 | 重启失败 → 回滚到 .bak（立即重启+检查） |
| 4 | ~10.5 分钟 | .bak 失败 → 尝试 .bak.1（立即） |
| 5 | ~11 分钟 | .bak.1 失败 → 尝试 .bak.2（立即） |
| ... | ~30秒/个 | 继续直到成功或全部失败 |
| 最后 | - | 所有备份都失败 → 通知你尝试过的所有备份 |

*每次备份重试约 30 秒（重启超时 + 健康检查）*

### 使用场景

- 保持 OpenClaw 24/7 运行
- 崩溃后自动恢复
- 出问题第一时间通知
- 配置出错自动回滚

### 安装运行

```bash
npm install
npm run init   # 配置（通知、间隔等）
npm start      # 前台运行（测试用）
```

### 服务管理（全部平台）

#### 安装服务（自动）

```bash
npm run service:install
```

#### 卸载服务

```bash
npm run service:uninstall
```

#### 重启服务

```bash
# macOS
launchctl stop com.openclaw.watchdog
launchctl start com.openclaw.watchdog

# Linux
systemctl --user restart openclaw-watchdog

# Windows
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
```

#### 查看服务状态和日志

```bash
# macOS
launchctl list | grep openclaw.watchdog
tail -30 ~/.openclaw-watchdog/watchdog.out.log   # 最近30行

# Linux
systemctl --user status openclaw-watchdog
journalctl --user -u openclaw-watchdog -f

# Windows
Get-ScheduledTaskInfo -TaskName "OpenClawWatchdog"
Get-Content "$env:USERPROFILE\.openclaw-watchdog\watchdog.out.log" -Tail 30
```

#### 测试通知

```bash
# 手动健康检查（会触发通知如果异常）
npm run check

# 前台运行查看所有日志
npm start
```

---

### 配置项

- `CLAW_NAME` - 通知显示名称
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`
- `NOTIFY_INTERVAL_MS` - 健康通知间隔（默认 1 小时）
- `QUIET_HOURS_START/END` - 静音时段（默认 23-10）
- `FAIL_THRESHOLD` - 失败次数触发重启（默认 2）
- `ROLLBACK_THRESHOLD` - 重启失败次数触发回滚（默认 1）
