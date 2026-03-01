import axios from 'axios';
import { logger } from '../utils/logger.js';

export async function notifyFeishu(config, message) {
  const { FEISHU_WEBHOOK_URL } = config;

  if (!FEISHU_WEBHOOK_URL) {
    throw new Error('FEISHU_WEBHOOK_URL not configured');
  }

  // Feishu webhook payload format
  const payload = {
    msg_type: 'text',
    content: {
      text: message
    }
  };

  const response = await axios.post(FEISHU_WEBHOOK_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });

  if (response.data?.code !== 0) {
    throw new Error(`Feishu API error: ${response.data?.msg || 'unknown'}`);
  }

  logger.info({}, 'feishu notification sent');
}
