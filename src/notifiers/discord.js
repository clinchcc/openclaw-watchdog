import axios from 'axios';

export async function notifyDiscord(config, text) {
  if (!config.DISCORD_WEBHOOK_URL) {
    throw new Error('Missing DISCORD_WEBHOOK_URL');
  }
  await axios.post(config.DISCORD_WEBHOOK_URL, { content: text });
}
