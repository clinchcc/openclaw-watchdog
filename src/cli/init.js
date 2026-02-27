import fs from 'node:fs';
import path from 'node:path';
import inquirer from 'inquirer';

export async function runInit() {
  const answers = await inquirer.prompt([
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
      default: '600000'
    },
    {
      type: 'input',
      name: 'FAIL_THRESHOLD',
      message: 'Consecutive failures before recovery attempt:',
      default: '1'
    },
    {
      type: 'input',
      name: 'ROLLBACK_THRESHOLD',
      message: 'Consecutive failures before rollback is allowed:',
      default: '5'
    },
    {
      type: 'confirm',
      name: 'AUTO_RESTART',
      message: 'Enable auto-restart?',
      default: true
    },
    {
      type: 'input',
      name: 'RESTART_COMMAND',
      message: 'Restart command:',
      default: 'openclaw gateway restart'
    },
    {
      type: 'confirm',
      name: 'AUTO_ROLLBACK',
      message: 'Enable auto-rollback?',
      default: true
    },
    {
      type: 'input',
      name: 'ROLLBACK_COMMAND',
      message: 'Rollback command:',
      default: '~/.openclaw/workspace/scripts/rollback.sh --auto'
    },
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
    }
  ]);

  const envPath = path.resolve(process.cwd(), '.env');
  const lines = Object.entries(answers).map(([k, v]) => `${k}=${String(v)}`);
  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8');

  console.log(`✅ Wrote ${envPath}`);
  console.log('Next: npm start');
}
