import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const BOT_WEBHOOK_URL = 'http://localhost:3006/webhook';

app.post('/message/sendText/:instance', async (req, res) => {
  console.log(`--- TESTER RECEIVED MESSAGE FOR INSTANCE ${req.params.instance} ---`);
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.post('/webhook', async (req, res) => {
  console.log('--- TESTER RECEIVED WEBHOOK ---');
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

async function simulateMessage(text: string) {
  const payload = {
    event: 'messages.upsert',
    instance: 'TEST_INSTANCE',
    data: {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false,
        id: 'ABC123XYZ'
      },
      pushName: 'João Silva',
      message: {
        conversation: text
      },
      messageTimestamp: Math.floor(Date.now() / 1000)
    }
  };

  console.log(`\nSimulating message: "${text}"`);
  try {
    const response = await axios.post(BOT_WEBHOOK_URL, payload);
    console.log('Bot response status:', response.status);
  } catch (error: any) {
    console.error('Error simulating message:', error.message);
  }
}

async function runTests() {
  console.log('Starting integration tests...');
  
  await simulateMessage('oi');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await simulateMessage('1'); // Agenda
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await simulateMessage('Quais os horários dos cultos?'); // Info / AI
  await new Promise(resolve => setTimeout(resolve, 2000));

  await simulateMessage('quero oração'); // Prayer
}

app.listen(3005, () => {
  console.log('Tester listening on port 3005');
  setTimeout(runTests, 2000);
});
