import axios from 'axios';
import { execaCommand } from 'execa';
import { notify } from '../notifiers/index.js';
import { logger } from '../utils/logger.js';
import { runRollback } from './rollback.js';

async function runCommand(cmd) {
  const { stdout, stderr } = await execaCommand(cmd, { shell: true });
  return [stdout, stderr].filter(Boolean).join('\n');
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

export async function recover(config, failCount) {
  if (config.autoRestart) {
    logger.warn({ cmd: config.RESTART_COMMAND }, 'attempting restart');
    try {
      await runCommand(config.RESTART_COMMAND);
      const afterRestart = await checkHealth(config);
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
        if (r.ok) return { recovered: true, step: 'rollback' };
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

  await notify(
    config,
    `[${config.CLAW_NAME}] 🔴 unhealthy (HTTP ${h.code || 'N/A'}). Trying recovery: restart first${
      state.failCount >= config.ROLLBACK_THRESHOLD ? ' -> rollback' : ''
    }.`
  );

  const result = await recover(config, state.failCount);
  if (result.recovered) {
    state.failCount = 0;
    await notify(config, `[${config.CLAW_NAME}] 🛠 recovery succeeded via ${result.step}.`);
  } else {
    await notify(config, `[${config.CLAW_NAME}] ❌ recovery failed. Manual intervention required.`);
  }
}

export async function runLoop(config) {
  const state = { failCount: 0, lastHealthyNotify: 0 };
  let inFlight = false;

  logger.info(
    {
      intervalMs: config.CHECK_INTERVAL_MS,
      notifyIntervalMs: config.NOTIFY_INTERVAL_MS,
      threshold: config.FAIL_THRESHOLD,
      rollbackThreshold: config.ROLLBACK_THRESHOLD
    },
    'watchdog started'
  );

  try {
    await notify(config, `[${config.CLAW_NAME}] 🚀 Watchdog service started successfully.`);
    logger.info({}, 'startup notification sent');
  } catch (e) {
    logger.warn({ err: e.message }, 'startup notification failed');
  }

  const tick = async () => {
    if (inFlight) {
      logger.warn('skip tick: previous run still in progress');
      return;
    }
    inFlight = true;
    try {
      await runOnce(config, state);
    } catch (e) {
      logger.error({ err: e.message }, 'runOnce failed');
    } finally {
      inFlight = false;
    }
  };

  await tick();
  setInterval(tick, config.CHECK_INTERVAL_MS);
}
