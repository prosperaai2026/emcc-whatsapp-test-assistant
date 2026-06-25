import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const interpretIntent = async (text: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente de WhatsApp para a Igreja EMCC.
          Classifique a intenção do usuário em uma das seguintes:
          - AGENDA
          - INFO
          - PRAYER
          - VISITOR
          - TALK_TO_LEADER
          - UNKNOWN

          Retorne apenas a palavra da intenção.`
        },
        {
          role: 'user',
          content: text
        }
      ],
    });

    return response.choices[0]?.message?.content?.trim();
  } catch (error) {
    console.error('Error interpreting intent:', error);
    return 'UNKNOWN';
  }
};
