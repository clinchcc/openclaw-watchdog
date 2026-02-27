# openclaw-watchdog 项目维护备忘

## 项目信息

- **GitHub**: https://github.com/clinchcc/openclaw-watchdog
- **描述**: OpenClaw 网关 watchdog，监控健康状态、自动恢复（重启/回滚）、定时通知
- **语言**: English（开源项目）
- **License**: MIT

## 本地源码位置

- **开发目录**: `/Users/cccc/.openclaw/workspace/openclaw-watchdog`
- **Git remote**: `origin https://github.com/clinchcc/openclaw-watchdog.git`

## 实例部署位置

### macOS（用户本机）

- **项目目录**: `/Users/cccc/WatchDog/openclaw-watchdog`
- **服务**: `com.openclaw.watchdog` (launchd)
- **日志**: `~/.openclaw-watchdog/watchdog.out.log`
- **配置**: `/Users/cccc/WatchDog/openclaw-watchdog/.env`
- **CLAW_NAME**: OpenClaw

### Windows（服务器）

- **项目目录**: `C:\Users\Administrator\.openclaw\watchdog\openclaw-watchdog`
- **服务**: 计划任务 `OpenClawWatchdog`
- **配置**: `C:\Users\Administrator\.openclaw\watchdog\openclaw-watchdog\.env`
- **CLAW_NAME**: Win

## 常用命令

### 本地开发

```bash
cd /Users/cccc/WatchDog/openclaw-watchdog
npm run check      # 手动检查一次健康状态
npm start          # 前台运行
```

### 服务管理

```bash
# macOS
launchctl start com.openclaw.watchdog
launchctl stop com.openclaw.watchdog
launchctl list | grep openclaw

# Windows（PowerShell）
Stop-ScheduledTask -TaskName "OpenClawWatchdog"
Start-ScheduledTask -TaskName "OpenClawWatchdog"
Get-ScheduledTaskInfo -TaskName "OpenClawWatchdog"
```

### 代码同步

```bash
# 拉取最新
git pull

# 推送修改
git add . && git commit -m "message" && git push
```

## 配置项说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `CLAW_NAME` | OpenClaw | 通知显示的名字 |
| `HEALTH_URL` | http://localhost:18789/health | 健康检查 URL |
| `CHECK_INTERVAL_MS` | 300000 | 检查间隔（5分钟） |
| `FAIL_THRESHOLD` | 2 | 连续失败次数触发恢复 |
| `ROLLBACK_THRESHOLD` | 5 | 连续失败次数触发回滚 |
| `NOTIFY_INTERVAL_MS` | 3600000 | 健康通知间隔（1小时） |
| `QUIET_HOURS_START` | 23 | 静音开始时间 |
| `QUIET_HOURS_END` | 10 | 静音结束时间 |
| `AUTO_RESTART` | true | 自动重启 |
| `AUTO_ROLLBACK` | true | 自动回滚 |
| `ROLLBACK_COMMAND` | internal | 回滚命令 |
| `NOTIFIER` | telegram | 通知渠道 |

## 通知消息格式

- 🚀 启动: `[CLAW_NAME] 🚀 Watchdog service started successfully.`
- 🔴 异常: `[CLAW_NAME] 🔴 unhealthy (HTTP xxx). Trying recovery...`
- 🟢 恢复: `[CLAW_NAME] 🟢 recovered (HTTP 200)`
- ✅ 健康: `[CLAW_NAME] ✅ healthy (HTTP 200)`（每 NOTIFY_INTERVAL_MS 发一次）
- 🛠 回滚: `[CLAW_NAME] 🛠 recovery succeeded via rollback.`
- ❌ 失败: `[CLAW_NAME] ❌ recovery failed. Manual intervention required.`

## 更新维护注意事项

1. **修改代码后** → `git push`，实例目录执行 `git pull`
2. **服务重启**: macOS 用 `launchctl`，Windows 用计划任务
3. **init 精简**: 不再询问的配置项直接写入 .env 默认值
4. **服务模板**: macOS/Linux/Windows 各自独立模板，确保 node 直跑
