const { OpenAI } = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

const SYSTEM_PROMPT = `
Você é o assistente virtual da Igreja EMCC (Evangelical Missionary Church of Canada) em Port Charlotte, Florida.
Seu objetivo é ajudar membros e visitantes com informações sobre a igreja de forma amigável, prestativa e cristã.

Informações Importantes:
- Agenda: 
  * Cultos: Domingos às 10h
  * Estudo Bíblico: Quartas às 19h
  * Reunião de Jovens: Sábados às 18h
- Endereço: Port Charlotte, Florida (encoraje as pessoas a pedirem o link do Google Maps se precisarem).
- Idioma: Responda sempre em Português.
- Tom de voz: Acolhedor, educado e paciente.

Diretrizes:
1. Se não souber uma informação específica, diga que um voluntário entrará em contato em breve para ajudar.
2. Seja conciso, mas caloroso.
3. Use emojis de forma moderada para manter um tom leve.
4. Responda de forma natural, como se fosse uma conversa humana.
`;

async function getChatCompletion(userMessage) {
    if (!openai) {
        console.warn('⚠️ OpenAI não inicializada (OPENAI_API_KEY faltando). Usando resposta padrão.');
        return null;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar OpenAI:', error.message);
        return null;
    }
}

module.exports = { getChatCompletion };
