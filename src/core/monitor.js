import axios from 'axios';
import { execaCommand } from 'execa';
import { notify } from '../notifiers/index.js';
import { logger } from '../utils/logger.js';

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

export async function recover(config) {
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

  if (config.autoRollback) {
    logger.warn({ cmd: config.ROLLBACK_COMMAND }, 'attempting rollback');
    try {
      await runCommand(config.ROLLBACK_COMMAND);
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
      await notify(config, `🟢 OpenClaw recovered (HTTP ${h.code})`);
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
    `🔴 OpenClaw unhealthy (HTTP ${h.code || 'N/A'}). Trying recovery: restart -> rollback.`
  );

  const result = await recover(config);
  if (result.recovered) {
    state.failCount = 0;
    await notify(config, `🛠 Recovery succeeded via ${result.step}.`);
  } else {
    await notify(config, '❌ Recovery failed. Manual intervention required.');
  }
}

export async function runLoop(config) {
  const state = { failCount: 0 };
  logger.info(
    { intervalMs: config.CHECK_INTERVAL_MS, threshold: config.FAIL_THRESHOLD },
    'watchdog started'
  );

  await runOnce(config, state);
  setInterval(() => {
    runOnce(config, state).catch((e) => logger.error({ err: e.message }, 'runOnce failed'));
  }, config.CHECK_INTERVAL_MS);
}
