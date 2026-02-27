import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  HEALTH_URL: z.string().url().default('http://localhost:18789/health'),
  CHECK_INTERVAL_MS: z.coerce.number().int().positive().default(600000),
  FAIL_THRESHOLD: z.coerce.number().int().positive().default(1),

  AUTO_RESTART: z.string().default('true'),
  RESTART_COMMAND: z.string().default('openclaw gateway restart'),

  AUTO_ROLLBACK: z.string().default('true'),
  ROLLBACK_COMMAND: z.string().default('~/.openclaw/workspace/scripts/rollback.sh --auto'),

  NOTIFIER: z.enum(['telegram', 'discord', 'whatsapp', 'none']).default('none'),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  DISCORD_WEBHOOK_URL: z.string().optional(),

  WHATSAPP_WEBHOOK_URL: z.string().optional(),
  WHATSAPP_WEBHOOK_TOKEN: z.string().optional()
});

export function loadConfig() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid config: ${parsed.error.message}`);
  }

  const cfg = parsed.data;
  return {
    ...cfg,
    autoRestart: cfg.AUTO_RESTART.toLowerCase() === 'true',
    autoRollback: cfg.AUTO_ROLLBACK.toLowerCase() === 'true'
  };
}
