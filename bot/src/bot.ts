import axios from 'axios';
import { interpretIntent } from './ai.js';

interface Session {
  state: 'IDLE' | 'AWAITING_PRAYER' | 'AWAITING_VISITOR_NAME' | 'AWAITING_VISITOR_CITY';
  data: any;
}

const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || 'http://localhost:3005').replace(/\/+$/, '');
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.INSTANCE_NAME;

export const processMessage = async (message: any) => {
  const remoteJid = message.key.remoteJid;
  const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  const pushName = message.pushName || 'visitante';

  if (!sessions[remoteJid]) {
    sessions[remoteJid] = { state: 'IDLE', data: {} };
  }

  const session = sessions[remoteJid]!;

  switch (session.state) {
    case 'IDLE':
      await handleMainMenu(remoteJid, text, pushName);
      break;
    case 'AWAITING_PRAYER':
      await handlePrayerRequest(remoteJid, text);
      break;
    case 'AWAITING_VISITOR_NAME':
      await handleVisitorName(remoteJid, text);
      break;
    case 'AWAITING_VISITOR_CITY':
      await handleVisitorCity(remoteJid, text);
      break;
    default:
      await sendMessage(remoteJid, 'Ops, algo deu errado. Digite "Oi" para recomeçar.');
      session.state = 'IDLE';
  }
};

const handleMainMenu = async (remoteJid: string, text: string, pushName: string) => {
  const normalizedText = text.toLowerCase().trim();
  let intent = '';

  if (normalizedText.includes('1') || normalizedText.includes('agenda')) {
    intent = 'AGENDA';
  } else if (normalizedText.includes('2') || normalizedText.includes('informações')) {
    intent = 'INFO';
  } else if (normalizedText.includes('3') || normalizedText.includes('oração')) {
    intent = 'PRAYER';
  } else if (normalizedText.includes('4') || normalizedText.includes('visitante')) {
    intent = 'VISITOR';
  } else if (normalizedText.includes('5') || normalizedText.includes('líder') || normalizedText.includes('falar')) {
    intent = 'TALK_TO_LEADER';
  } else if (normalizedText.includes('relatório') || normalizedText.includes('relatorio')) {
    intent = 'SEND_WEEKLY_REPORT';
  } else if (normalizedText.length > 3) {
    intent = await interpretIntent(text) || '';
  }

  switch (intent) {
    case 'AGENDA':
      await showAgenda(remoteJid);
      break;
    case 'INFO':
      await showChurchInfo(remoteJid);
      break;
    case 'PRAYER':
      if (sessions[remoteJid]) sessions[remoteJid]!.state = 'AWAITING_PRAYER';
      await sendMessage(remoteJid, '🙏 Por favor, escreva aqui o seu pedido de oração. Nossa equipe estará orando por você.');
      break;
    case 'VISITOR':
      if (sessions[remoteJid]) sessions[remoteJid]!.state = 'AWAITING_VISITOR_NAME';
      await sendMessage(remoteJid, '👋 Que alegria ter você conosco! Qual é o seu nome completo?');
      break;
    case 'TALK_TO_LEADER':
      await sendMessage(remoteJid, '🤝 Um de nossos líderes entrará em contato em breve. Se for urgente, entre em contato com a secretaria da igreja.');
      break;
    case 'SEND_WEEKLY_REPORT':
      await handleWeeklyReportRequest(remoteJid);
      break;
    default:
      await handleUnknownIntent(remoteJid, text, pushName);
  }
};

const handleWeeklyReportRequest = async (remoteJid: string) => {
  const phone = remoteJid.split('@')[0];
  try {
    const response = await axios.get(`${BACKEND_API_URL}/leaders?active=true`);
    const leaders = response.data.data;
    const isLeader = leaders.some((l: any) => l.phone.includes(phone) || phone.includes(l.phone.replace(/\D/g, '')));
    
    if (!isLeader) {
      await sendMessage(remoteJid, '❌ Desculpe, esta função é restrita para a liderança cadastrada.');
      return;
    }

    await sendMessage(remoteJid, '📊 Gerando relatório semanal... um momento.');
    await sendWeeklyReportToJid(remoteJid);
  } catch (error) {
    console.error('Error checking leader status:', error);
    await sendMessage(remoteJid, 'Ops, tive um erro ao verificar sua permissão.');
  }
};

export const sendWeeklyReportToAllLeaders = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/leaders?active=true`);
    const leaders = response.data.data;
    for (const leader of leaders) {
      const jid = `${leader.phone.replace(/\D/g, '')}@s.whatsapp.net`;
      await sendWeeklyReportToJid(jid);
    }
  } catch (error) {
    console.error('Error sending report to all leaders:', error);
  }
};

const sendWeeklyReportToJid = async (jid: string) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/reports/weekly`);
    if (response.data.success) {
      const report = response.data.data;
      let text = `📊 *RELATÓRIO SEMANAL PROSPERA AI*\n\n`;
      text += `📅 Período: ${report.period}\n\n`;
      text += `👥 *Novos Visitantes:* ${report.visitors_count}\n`;
      text += `🙏 *Pedidos de Oração:* ${report.prayer_requests_count}\n`;
      text += `📅 *Eventos na Semana:* ${report.events_count}\n`;
      text += `🎂 *Aniversariantes:* ${report.birthdays_count}\n\n`;
      
      if (report.visitors && report.visitors.length > 0) {
        text += `*Visitantes:* ${report.visitors.map((v: any) => v.name).join(', ')}\n\n`;
      }
      
      text += `_Este é um resumo automático para auxiliar a liderança._`;
      await sendMessage(jid, text);
    }
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    await sendMessage(jid, 'Ops, tive um erro ao carregar o relatório semanal.');
  }
};

const handleUnknownIntent = async (remoteJid: string, text: string, pushName: string) => {
  try {
    const searchResponse = await axios.post(`${BACKEND_API_URL}/knowledge-base/search`, { query: text });
    if (searchResponse.data.success && searchResponse.data.data && searchResponse.data.data.length > 0) {
      const topResult = searchResponse.data.data[0];
      await sendMessage(remoteJid, `💡 *Encontrei isso na nossa base de conhecimento:*\n\n*Pergunta:* ${topResult.question}\n*Resposta:* ${topResult.answer}`);
      return;
    }
  } catch (error) {
    console.error('Error searching knowledge base:', error);
  }

  const welcome = await getWelcomeMessage();
  await sendMessage(remoteJid, `${welcome}\n\nComo posso te ajudar hoje?\n\n1. 🗓️ *Agenda*\n2. 📍 *Informações*\n3. 🙏 *Pedido de Oração*\n4. 👋 *Sou Visitante*\n5. 🤝 *Falar com Líder*`);
};

const getWelcomeMessage = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/info`);
    if (response.data.success) {
      return response.data.data.welcome_message || 'Olá! Bem-vindo à nossa igreja.';
    }
  } catch (error) {
    console.error('Error fetching welcome message:', error);
  }
  return 'Olá! Bem-vindo à nossa igreja.';
};

const showAgenda = async (remoteJid: string) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/events?period=week`);
    if (response.data.success) {
      const events = response.data.data;
      if (!events || events.length === 0) {
        await sendMessage(remoteJid, '🗓️ Não temos eventos programados para esta semana.');
        return;
      }
      let agendaText = '🗓️ *Agenda da Semana:*\n\n';
      events.forEach((event: any) => {
        const date = new Date(event.start_time).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' });
        agendaText += `🔹 *${event.title}*\n📅 ${date}\n📍 ${event.location || 'Igreja'}\n\n`;
      });
      await sendMessage(remoteJid, agendaText);
    }
  } catch (error) {
    console.error('Error fetching agenda:', error);
    await sendMessage(remoteJid, 'Ops, não consegui carregar a agenda agora. Tente novamente mais tarde.');
  }
};

const showChurchInfo = async (remoteJid: string) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/info`);
    if (response.data.success) {
      const info = response.data.data;
      const infoText = `📍 *${info.name}*\n\n🏠 *Endereço:* ${info.address}, ${info.city} - ${info.state}\n\n👨‍🏫 *Pastores:* ${info.pastor_name}\n\n⏰ *Cultos:* ${info.service_times}\n\nℹ️ *Sobre nós:* ${info.about}`;
      await sendMessage(remoteJid, infoText);
    }
  } catch (error) {
    console.error('Error fetching church info:', error);
    await sendMessage(remoteJid, 'Ops, não consegui carregar as informações agora.');
  }
};

const handlePrayerRequest = async (remoteJid: string, text: string) => {
  try {
    const phone = remoteJid.split('@')[0];
    await axios.post(`${BACKEND_API_URL}/prayer-requests`, {
      name: 'Usuário WhatsApp',
      phone: phone,
      request: text
    });
    await sendMessage(remoteJid, '🙏 Recebemos seu pedido de oração. Nossa equipe de intercessão estará orando por você. Que o Senhor te abençoe!');
  } catch (error) {
    console.error('Error saving prayer request:', error);
    await sendMessage(remoteJid, '🙏 Seu pedido foi anotado mentalmente, mas tive um erro ao salvar no sistema. Pode ter certeza que Deus já ouviu!');
  }
  if (sessions[remoteJid]) sessions[remoteJid]!.state = 'IDLE';
};

const handleVisitorName = async (remoteJid: string, text: string) => {
  if (sessions[remoteJid]) {
    sessions[remoteJid]!.data.name = text;
    sessions[remoteJid]!.state = 'AWAITING_VISITOR_CITY';
    await sendMessage(remoteJid, `Prazer, ${text}! De qual cidade você é?`);
  }
};

const handleVisitorCity = async (remoteJid: string, text: string) => {
  if (sessions[remoteJid]) {
    sessions[remoteJid]!.data.city = text;
    try {
      const phone = remoteJid.split('@')[0];
      await axios.post(`${BACKEND_API_URL}/visitors`, {
        name: sessions[remoteJid]!.data.name,
        phone: phone,
        city: text,
        how_they_found_us: 'WhatsApp Bot'
      });
      await sendMessage(remoteJid, '✅ Cadastro realizado com sucesso! Ficamos muito felizes com seu contato. Em breve alguém de nossa equipe falará com você para te dar as boas-vindas oficiais! ❤️');
    } catch (error) {
      console.error('Error saving visitor:', error);
      await sendMessage(remoteJid, '✅ Seu cadastro foi recebido, mas tive um pequeno erro ao processar. Mas não se preocupe, já sabemos que você está por aqui! Bem-vindo!');
    }
    sessions[remoteJid]!.state = 'IDLE';
  }
};

const sendMessage = async (remoteJid: string, text: string) => {
  console.log(`[BOT SENDING TO ${remoteJid}]: ${text}`);

  try {
    await axios.post(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      number: remoteJid,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: text
      }
    }, {
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
