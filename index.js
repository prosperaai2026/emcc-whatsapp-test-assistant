require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getChatCompletion } = require('./openaiService');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'messages.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Garantir que o arquivo de dados existe
if (!fs.existsSync(DATA_FILE)) {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Funções auxiliares
const getMessages = () => {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const saveMessage = (message) => {
    const messages = getMessages();
    messages.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message
    });
    // Limitar histórico a 100 mensagens
    if (messages.length > 100) messages.shift();
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
};

const sendWhatsAppMessage = async (to, text) => {
    let apiUrl = process.env.WHATSAPP_API_URL || '';
    const apiKey = process.env.WHATSAPP_API_KEY;
    const instance = process.env.WHATSAPP_INSTANCE_NAME;

    // 1. URL Inteligente: Garante que o endpoint esteja correto sem duplicar paths
    apiUrl = apiUrl.replace(/\/+$/, ''); // Remove barras no final
    let endpoint = apiUrl;
    
    if (!apiUrl.includes('/message/sendText')) {
        endpoint = `${apiUrl}/message/sendText/${instance}`;
    } else if (!apiUrl.endsWith(`/${instance}`)) {
        // Se já tem sendText mas falta a instância no final
        endpoint = `${apiUrl}/${instance}`;
    }

    // 2. Formato de Número Flexível:
    // Se for contato individual (@s.whatsapp.net), extrai apenas dígitos para compatibilidade agressiva.
    // Se for grupo (@g.us), mantém o formato sem o identificador de dispositivo (:1).
    let number = to;
    if (to.includes('@s.whatsapp.net')) {
        number = to.split('@')[0].replace(/[^0-9]/g, '');
    } else {
        number = to.replace(/:[0-9]+@/, '@');
    }

    const payload = {
        number: number,
        text: text
    };

    console.log(`[Outbound] Enviando para: ${number}`);
    console.log(`[Outbound] URL: ${endpoint}`);
    console.log(`[Outbound] Payload:`, JSON.stringify(payload, null, 2));

    if (endpoint && apiKey) {
        try {
            await axios.post(endpoint, payload, {
                headers: {
                    'apikey': apiKey,
                    'apiKey': apiKey, // Suporte redundante
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Mensagem entregue para ${number}`);
        } catch (error) {
            console.error('❌ Falha na entrega Evolution API:');
            console.error(`URL tentada: ${endpoint}`);
            if (error.response) {
                console.error('Status HTTP:', error.response.status);
                console.error('Resposta da API:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Erro na requisição:', error.message);
            }
        }
    } else {
        console.warn('⚠️ Configurações de WhatsApp incompletas no arquivo .env');
    }
};

// Rotas da API para o Dashboard
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', uptime: process.uptime() });
});

app.get('/api/messages', (req, res) => {
    res.json(getMessages());
});

app.post('/api/clear', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    res.json({ success: true });
});

// Webhook para receber mensagens da Evolution API
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        console.log('Webhook recebido:', JSON.stringify(body, null, 2));

        // Formato Evolution API: body.data.key.remoteJid e body.data.message.conversation
        // Também pode ser body.event === 'messages.upsert'
        
        let sender = '';
        let messageText = '';

        if (body.event === 'messages.upsert' && body.data) {
            const data = body.data;
            sender = data.key.remoteJid;
            
            // Ignorar mensagens enviadas por mim mesmo
            if (data.key.fromMe) {
                return res.json({ status: 'ignored', reason: 'fromMe' });
            }

            // Extrair texto da mensagem (suporta conversa simples e legendas de imagem/video)
            messageText = data.message?.conversation || 
                          data.message?.extendedTextMessage?.text || 
                          data.message?.imageMessage?.caption || 
                          data.message?.videoMessage?.caption || '';
        } else if (body.sender && body.message) {
            // Suporte para o formato de teste do dashboard
            sender = body.sender;
            messageText = body.message;
        }

        if (!sender || !messageText) {
            return res.json({ status: 'ignored', reason: 'no_content' });
        }

        console.log(`Mensagem de ${sender}: ${messageText}`);

        let responseText = '';
        
        // Tentar obter resposta da IA
        const aiResponse = await getChatCompletion(messageText);
        
        if (aiResponse) {
            responseText = aiResponse;
        } else {
            // Fallback para lógica de palavras-chave se a IA falhar
            const cleanMessage = messageText.toLowerCase().trim();
            if (cleanMessage.includes('agenda')) {
                responseText = '🗓️ *Agenda EMCC:*\n- Cultos: Domingos às 10h\n- Estudo Bíblico: Quartas às 19h\n- Reunião de Jovens: Sábados às 18h';
            } else if (cleanMessage.includes('endereço') || cleanMessage.includes('endereco')) {
                responseText = '📍 *Endereço EMCC:*\nPort Charlotte, Florida\n(Para mais detalhes, consulte nosso site ou Google Maps)';
            } else {
                responseText = 'Olá! Recebemos sua mensagem e um de nossos voluntários entrará em contato em breve. 🙏';
            }
        }

        // Salvar no histórico
        saveMessage({
            sender,
            text: messageText,
            response: responseText,
            type: 'received'
        });

        // Enviar resposta automática
        await sendWhatsAppMessage(sender, responseText);

        res.json({ success: true, response: responseText });
    } catch (error) {
        console.error('Erro no processamento do webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
