import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  CLAW_NAME: z.string().default('OpenClaw'),
  NOTIFY_INTERVAL_MS: z.coerce.number().int().min(0).default(3600000), // 1 hour default
  QUIET_HOURS_START: z.coerce.number().int().min(0).max(23).default(23), // quiet hours start (hour, 0-23)
  QUIET_HOURS_END: z.coerce.number().int().min(0).max(23).default(8),   // quiet hours end (hour, 0-23)
  PROJECT_DIR: z.string().optional(),
  OPENCLAW_CONFIG_PATH: z.string().optional(),
  HEALTH_URL: z.string().url().default('http://localhost:18789/health'),
  CHECK_INTERVAL_MS: z.coerce.number().int().positive().default(300000),
  FAIL_THRESHOLD: z.coerce.number().int().positive().default(2),
  ROLLBACK_THRESHOLD: z.coerce.number().int().positive().default(1),
  STARTUP_DELAY_MS: z.coerce.number().int().min(0).default(10000),
  RECOVER_COOLDOWN_MS: z.coerce.number().int().min(0).default(30000),

  AUTO_RESTART: z.string().default('true'),
  RESTART_COMMAND: z.string().default('openclaw gateway restart'),

  AUTO_ROLLBACK: z.string().default('true'),
  ROLLBACK_COMMAND: z.string().default('internal'),

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
