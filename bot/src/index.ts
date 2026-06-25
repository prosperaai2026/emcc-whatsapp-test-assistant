import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { handleWebhook } from './webhook.js';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running!');
});

app.post('/webhook', handleWebhook);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});
