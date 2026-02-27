import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import inquirer from 'inquirer';
import { installService, uninstallService } from '../doctor/service.js';

export async function runInit() {
  const autoConfigPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'CLAW_NAME',
      message: 'Claw name for notifications:',
      default: 'OpenClaw'
    },
    // OPENCLAW_CONFIG_PATH not asked, defaults to auto-detect
    {
      type: 'input',
      name: 'HEALTH_URL',
      message: 'OpenClaw health URL:',
      default: 'http://localhost:18789/health'
    },
    {
      type: 'input',
      name: 'CHECK_INTERVAL_MS',
      message: 'Check interval (ms):',
      default: '300000'
    },
    {
      type: 'input',
      name: 'FAIL_THRESHOLD',
      message: 'Consecutive failures before recovery attempt:',
      default: '2'
    },
    {
      type: 'input',
      name: 'ROLLBACK_THRESHOLD',
      message: 'Consecutive failures before rollback is allowed:',
      default: '5'
    },
    // AUTO_RESTART and RESTART_COMMAND not asked, defaults set below
    // AUTO_ROLLBACK and ROLLBACK_COMMAND not asked, defaults set below
    {
      type: 'list',
      name: 'NOTIFIER',
      message: 'Notifier provider:',
      choices: ['telegram', 'discord', 'whatsapp', 'none'],
      default: 'telegram'
    },
    {
      type: 'input',
      name: 'TELEGRAM_BOT_TOKEN',
      message: 'Telegram bot token:',
      when: (a) => a.NOTIFIER === 'telegram'
    },
    {
      type: 'input',
      name: 'TELEGRAM_CHAT_ID',
      message: 'Telegram chat id:',
      when: (a) => a.NOTIFIER === 'telegram'
    },
    {
      type: 'input',
      name: 'DISCORD_WEBHOOK_URL',
      message: 'Discord webhook URL:',
      when: (a) => a.NOTIFIER === 'discord'
    },
    {
      type: 'input',
      name: 'WHATSAPP_WEBHOOK_URL',
      message: 'WhatsApp webhook URL:',
      when: (a) => a.NOTIFIER === 'whatsapp'
    },
    {
      type: 'input',
      name: 'WHATSAPP_WEBHOOK_TOKEN',
      message: 'WhatsApp webhook token (optional):',
      when: (a) => a.NOTIFIER === 'whatsapp'
    },
    {
      type: 'list',
      name: 'SERVICE_ACTION',
      message: 'Persistent service action after config:',
      choices: [
        { name: 'Do nothing', value: 'none' },
        { name: 'Install service', value: 'install' },
        { name: 'Uninstall service', value: 'uninstall' }
      ],
      default: 'none'
    }
  ]);

  const envPath = path.resolve(process.cwd(), '.env');
  const { SERVICE_ACTION, ...envValues } = answers;
  envValues.PROJECT_DIR = process.cwd();
  // Set defaults (not asked in init, but written to .env)
  envValues.NOTIFY_INTERVAL_MS = envValues.NOTIFY_INTERVAL_MS || '3600000';
  envValues.QUIET_HOURS_START = envValues.QUIET_HOURS_START || '23';
  envValues.QUIET_HOURS_END = envValues.QUIET_HOURS_END || '10';
  envValues.OPENCLAW_CONFIG_PATH = envValues.OPENCLAW_CONFIG_PATH || '';
  envValues.AUTO_RESTART = envValues.AUTO_RESTART !== undefined ? envValues.AUTO_RESTART : 'true';
  envValues.RESTART_COMMAND = envValues.RESTART_COMMAND || 'openclaw gateway restart';
  envValues.AUTO_ROLLBACK = envValues.AUTO_ROLLBACK !== undefined ? envValues.AUTO_ROLLBACK : 'true';
  envValues.ROLLBACK_COMMAND = envValues.ROLLBACK_COMMAND || 'internal';
  const lines = Object.entries(envValues).map(([k, v]) => `${k}=${String(v)}`);
  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8');

  console.log(`✅ Wrote ${envPath}`);
  if (!String(envValues.OPENCLAW_CONFIG_PATH || '').trim()) {
    console.log(`ℹ️ OPENCLAW_CONFIG_PATH is empty, auto-detect will use: ${autoConfigPath}`);
  }

  if (SERVICE_ACTION === 'install') {
    const msg = await installService();
    console.log(`✅ ${msg}`);
  } else if (SERVICE_ACTION === 'uninstall') {
    const msg = await uninstallService();
    console.log(`✅ ${msg}`);
  }

  console.log('\n🎉 Setup completed successfully.');
  console.log('Manual run (foreground): npm start');
  console.log('Service mode commands:');
  console.log('  - Install:   npm run service:install');
  console.log('  - Uninstall: npm run service:uninstall');
}
