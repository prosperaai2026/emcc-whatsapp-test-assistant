import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/whatsapp/webhook - Recebe mensagens do Evolution API
router.post('/', async (req: Request, res: Response) => {
  try {
    const message = req.body;
    console.log('[Webhook] Mensagem recebida:', JSON.stringify(message));

    // Extrair dados da mensagem (Evolution API format)
    const from = message?.key?.remoteJid || message?.from || '';
    const text = message?.message?.conversation || 
                 message?.message?.extendedTextMessage?.text || 
                 message?.text || '';
    const pushName = message?.pushName || '';

    // Encaminhar para o bot processar
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL || 'http://localhost:3006/webhook';
    try {
      await fetch(botWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (e) {
      console.error('[Webhook] Erro ao encaminhar para o bot:', e);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Mensagem recebida e encaminhada',
      data: { from, text, pushName }
    });
  } catch (error) {
    console.error('[Webhook] Erro:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar mensagem' });
  }
});

// GET /api/whatsapp/webhook - Verificação do webhook (Evolution API requer)
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'webhook ativo' });
});

export default router;
