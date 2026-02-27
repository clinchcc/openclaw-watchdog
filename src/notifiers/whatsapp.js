import axios from 'axios';

export async function notifyWhatsApp(config, text) {
  if (!config.WHATSAPP_WEBHOOK_URL) {
    throw new Error('Missing WHATSAPP_WEBHOOK_URL');
  }
  await axios.post(
    config.WHATSAPP_WEBHOOK_URL,
    { text },
    {
      headers: config.WHATSAPP_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${config.WHATSAPP_WEBHOOK_TOKEN}` }
        : undefined
    }
  );
}
