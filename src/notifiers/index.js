import { notifyTelegram } from './telegram.js';
import { notifyDiscord } from './discord.js';
import { notifyWhatsApp } from './whatsapp.js';
import { notifyFeishu } from './feishu.js';

export async function notify(config, text) {
  if (config.NOTIFIER === 'none') return;
  if (config.NOTIFIER === 'telegram') return notifyTelegram(config, text);
  if (config.NOTIFIER === 'discord') return notifyDiscord(config, text);
  if (config.NOTIFIER === 'whatsapp') return notifyWhatsApp(config, text);
  if (config.NOTIFIER === 'feishu') return notifyFeishu(config, text);
}
