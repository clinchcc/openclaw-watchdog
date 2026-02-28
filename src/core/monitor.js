import axios from 'axios';
import { execaCommand } from 'execa';
import { notify } from '../notifiers/index.js';
import { logger } from '../utils/logger.js';
import { runRollback } from './rollback.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runCommand(cmd, timeoutMs = 30000) {
  try {
    const { stdout, stderr } = await execaCommand(cmd, { shell: true, timeout: timeoutMs });
    return [stdout, stderr].filter(Boolean).join('\n');
  } catch (e) {
    if (e.timedOut) {
      throw new Error(`Command timed out after ${timeoutMs}ms: ${cmd}`);
    }
    throw e;
  }
}

export async function checkHealth(config) {
  try {
    const res = await axios.get(config.HEALTH_URL, { timeout: 8000 });
    return { ok: res.status >= 200 && res.status < 300, code: res.status };
  } catch (e) {
    const code = e?.response?.status || 0;
    return { ok: false, code };
  }
}

export async function recover(config, failCount, options = {}) {
  const skipRestart = options.skipRestart || false;
  if (config.autoRestart && !skipRestart) {
    logger.warn({ cmd: config.RESTART_COMMAND }, 'attempting restart');
    try {
      await runCommand(config.RESTART_COMMAND);
      const afterRestart = await Promise.race([
        checkHealth(config),
        new Promise((_, reject) => setTimeout(() => reject(new Error('health check timeout')), 15000))
      ]);
      if (afterRestart.ok) return { recovered: true, step: 'restart' };
    } catch (e) {
      logger.error({ err: e.message }, 'restart failed');
    }
  }

  if (config.autoRollback && failCount >= config.ROLLBACK_THRESHOLD) {
    logger.warn(
      { cmd: config.ROLLBACK_COMMAND, failCount, rollbackThreshold: config.ROLLBACK_THRESHOLD },
      'attempting rollback'
    );
    try {
      if (config.ROLLBACK_COMMAND === 'internal') {
        const r = await runRollback({
          auto: true,
          configPath: config.OPENCLAW_CONFIG_PATH || '',
          healthUrl: config.HEALTH_URL,
          restartCommand: config.RESTART_COMMAND
        });
        if (r.ok) return { recovered: true, step: 'rollback', selectedBackup: r.selectedBackup, errBak: r.errBak, cfg: r.cfg };
        return { recovered: false, step: r.step, selectedBackup: r.selectedBackup, errBak: r.errBak, cfg: r.cfg };
      } else {
        const hasConfigPathArg = /(^|\s)--config-path(\s|=)/.test(config.ROLLBACK_COMMAND);
        const rollbackCmd = `${config.ROLLBACK_COMMAND} ${
          config.OPENCLAW_CONFIG_PATH && !hasConfigPathArg
            ? `--config-path "${config.OPENCLAW_CONFIG_PATH}"`
            : ''
        }`.trim();
        await runCommand(rollbackCmd);
      }

      const afterRollback = await checkHealth(config);
      if (afterRollback.ok) return { recovered: true, step: 'rollback' };
    } catch (e) {
      logger.error({ err: e.message }, 'rollback failed');
    }
  }

  return { recovered: false, step: 'none' };
}

export async function runOnce(config, state) {
  const h = await checkHealth(config);
  if (h.ok) {
    if (state.failCount > 0) {
      await notify(config, `[${config.CLAW_NAME}] 🟢 recovered (HTTP ${h.code})`);
      state.lastHealthyNotify = Date.now();
    } else if (config.NOTIFY_INTERVAL_MS > 0) {
      const now = Date.now();
      const hour = new Date().getHours();
      const isQuietHours =
        config.QUIET_HOURS_START > config.QUIET_HOURS_END
          ? hour >= config.QUIET_HOURS_START || hour < config.QUIET_HOURS_END
          : hour >= config.QUIET_HOURS_START && hour < config.QUIET_HOURS_END;

      if (!isQuietHours && now - state.lastHealthyNotify >= config.NOTIFY_INTERVAL_MS) {
        await notify(config, `[${config.CLAW_NAME}] ✅ healthy (HTTP ${h.code})`).catch(() => {});
        state.lastHealthyNotify = now;
      }
    }
    state.failCount = 0;
    logger.info({ code: h.code }, 'healthy');
    return;
  }

  state.failCount += 1;
  logger.warn({ code: h.code, failCount: state.failCount }, 'health check failed');

  if (state.failCount < config.FAIL_THRESHOLD) return;

  // Track restart attempts (separate from failCount)
  if (!state.restartAttempts) state.restartAttempts = 0;
  const shouldRollback = state.restartAttempts >= config.ROLLBACK_THRESHOLD;

  if (shouldRollback) {
    await notify(config, `[${config.CLAW_NAME}] 🔴 unhealthy. Starting rollback directly (restart failed ${state.restartAttempts} times).`);
  } else {
    await notify(config, `[${config.CLAW_NAME}] 🔴 unhealthy (HTTP ${h.code || 'N/A'}). Trying recovery: restart first.`);
  }

  const result = shouldRollback
    ? await recover(config, state.restartAttempts, { skipRestart: true })
    : await recover(config, state.restartAttempts);

  if (!shouldRollback) {
    state.restartAttempts += 1;
    logger.info({ restartAttempts: state.restartAttempts, rollbackThreshold: config.ROLLBACK_THRESHOLD }, 'restart attempt counted');
  }
  if (result.recovered) {
    state.failCount = 0;
    let msg = `[${config.CLAW_NAME}] 🛠 recovery succeeded via ${result.step}.`;
    if (result.step?.includes('rollback')) {
      if (result.selectedBackup) msg += `\n📂 Restored from: ${result.selectedBackup}`;
      if (result.errBak) msg += `\n🗑 Broken config saved to: ${result.errBak}`;
      msg += `\n\nTo find the cause, diff the two files:\n  diff "${result.errBak}" "${result.selectedBackup}"`;
    }
    await notify(config, msg);
  } else {
    let msg = `[${config.CLAW_NAME}] ❌ recovery failed. Manual intervention required.`;
    if (result.step?.includes('rollback')) {
      if (result.selectedBackup) msg += `\n📂 Attempted backup: ${result.selectedBackup}`;
      if (result.errBak) msg += `\n🗑 Broken config saved to: ${result.errBak}`;
    }
    await notify(config, msg);
  }

  if (config.RECOVER_COOLDOWN_MS > 0) {
    logger.info({ cooldownMs: config.RECOVER_COOLDOWN_MS }, 'cooling down after recovery attempt');
    await sleep(config.RECOVER_COOLDOWN_MS);
  }
}

export async function runLoop(config) {
  const state = { failCount: 0, lastHealthyNotify: 0 };

  logger.info(
    {
      intervalMs: config.CHECK_INTERVAL_MS,
      notifyIntervalMs: config.NOTIFY_INTERVAL_MS,
      threshold: config.FAIL_THRESHOLD,
      rollbackThreshold: config.ROLLBACK_THRESHOLD,
      startupDelayMs: config.STARTUP_DELAY_MS,
      recoverCooldownMs: config.RECOVER_COOLDOWN_MS
    },
    'watchdog started'
  );

  try {
    await notify(config, `[${config.CLAW_NAME}] 🚀 Watchdog service started successfully.`);
    logger.info({}, 'startup notification sent');
  } catch (e) {
    logger.warn({ err: e.message }, 'startup notification failed');
  }

  if (config.STARTUP_DELAY_MS > 0) {
    logger.info({ delayMs: config.STARTUP_DELAY_MS }, 'waiting startup grace period');
    await sleep(config.STARTUP_DELAY_MS);
  }

  const scheduleNext = () => setTimeout(tick, config.CHECK_INTERVAL_MS);

  async function tick() {
    try {
      await runOnce(config, state);
    } catch (e) {
      logger.error({ err: e.message }, 'runOnce failed');
    }
    scheduleNext();
  }

  await tick();
}
