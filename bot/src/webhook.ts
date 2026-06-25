import type { Request, Response } from 'express';
import { processMessage } from './bot.js';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('Webhook received:', JSON.stringify(data, null, 2));

    // Evolution API sends 'messages.upsert' event for new messages
    if (data.event === 'messages.upsert') {
      const message = data.data;
      if (!message.key.fromMe) {
        await processMessage(message);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};
