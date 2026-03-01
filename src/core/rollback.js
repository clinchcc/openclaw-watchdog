import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execaCommand } from 'execa';
import axios from 'axios';

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes()
  )}${pad(d.getSeconds())}`;
}

function resolveConfigPath(explicitPath) {
  if (explicitPath) return explicitPath;
  return path.join(os.homedir(), '.openclaw', 'openclaw.json');
}

function listBackups(cfgPath) {
  const dir = path.dirname(cfgPath);
  const base = path.basename(cfgPath);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(`${base}.`) && f.endsWith('.bak') && !f.includes('.err-'))
    .map((f) => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs); // newest first
}

function pickPrimaryBackup(cfgPath, backupArg) {
  if (backupArg) return backupArg;
  const direct = `${cfgPath}.bak`;
  if (fs.existsSync(direct)) return direct;
  return listBackups(cfgPath)[0] || '';
}

async function checkHealth(healthUrl) {
  try {
    const res = await axios.get(healthUrl, { timeout: 8000 });
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

async function restart(restartCommand) {
  await execaCommand(restartCommand, { shell: true });
}

export async function runRollback({
  auto = false,
  backup = '',
  configPath = '',
  healthUrl = 'http://localhost:18789/health',
  restartCommand = 'openclaw gateway restart'
}) {
  const cfg = resolveConfigPath(configPath);
  if (!fs.existsSync(cfg)) {
    throw new Error(`Config not found: ${cfg}`);
  }

  // restart first
  await restart(restartCommand).catch(() => {});
  if (await checkHealth(healthUrl)) {
    return { ok: true, step: 'restart-only', cfg };
  }

  if (!auto) {
    throw new Error('Non-auto rollback flow is not implemented yet. Use --auto.');
  }

  // Backup the broken config
  const errBak = `${cfg}.err-${nowStamp()}.bak`;
  fs.copyFileSync(cfg, errBak);

  // Get all available backups
  const allBackups = listBackups(cfg);
  if (allBackups.length === 0) {
    return {
      ok: false,
      step: 'rollback-missing-backup',
      cfg,
      errBak,
      triedBackups: [],
      message: `No backup found. Expected at least ${cfg}.bak`
    };
  }

  // Try each backup in order (newest first)
  const triedBackups = [];
  for (const backupFile of allBackups) {
    triedBackups.push(backupFile);
    
    // Restore this backup
    fs.copyFileSync(backupFile, cfg);
    
    // Try restarting with this backup
    await restart(restartCommand).catch(() => {});
    
    if (await checkHealth(healthUrl)) {
      return {
        ok: true,
        step: 'rollback-success',
        cfg,
        errBak,
        selectedBackup: backupFile,
        triedBackups
      };
    }
  }

  // All backups failed
  return {
    ok: false,
    step: 'rollback-failed-all',
    cfg,
    errBak,
    triedBackups,
    message: `All ${triedBackups.length} backups failed. Check error config: ${errBak}`
  };
}
