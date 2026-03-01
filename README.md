# openclaw-watchdog

**English** | [中文](#openclaw-watchdog-中文)

---

## <a name="english"></a>English

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

#### Check Service Status

```bash
# macOS
launchctl list | grep openclaw.watchdog
tail -f ~/.openclaw-watchdog/watchdog.out.log

# Linux
systemctl --user status openclaw-watchdog
journalctl --user -u openclaw-watchdog -f

# Windows
Get-ScheduledTaskInfo -TaskName "OpenClawWatchdog"
```

---

## <a name="openclaw-watchdog-中文"></a>openclaw-watchdog

**[English](#english)** | 中文

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

#### 查看服务状态

```bash
# macOS
launchctl list | grep openclaw.watchdog
tail -f ~/.openclaw-watchdog/watchdog.out.log

# Linux
systemctl --user status openclaw-watchdog
journalctl --user -u openclaw-watchdog -f

# Windows
Get-ScheduledTaskInfo -TaskName "OpenClawWatchdog"
```

---

### 配置项

- `CLAW_NAME` - 通知显示名称
- `NOTIFIER` = `telegram|discord|whatsapp|feishu|none`
- `NOTIFY_INTERVAL_MS` - 健康通知间隔（默认 1 小时）
- `QUIET_HOURS_START/END` - 静音时段（默认 23-10）
- `FAIL_THRESHOLD` - 失败次数触发重启（默认 2）
- `ROLLBACK_THRESHOLD` - 重启失败次数触发回滚（默认 1）
