import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// GET /api/info - Retorna informações da igreja
router.get('/', (_req: Request, res: Response) => {
  try {
    const info = db.prepare('SELECT * FROM church_info WHERE id = 1').get();
    if (!info) {
      return res.status(404).json({ success: false, error: 'Informações da igreja não encontradas' });
    }

    // Parse JSON fields for better response
    const result = {
      ...info as any,
      service_times: JSON.parse((info as any).service_times || '{}'),
    };

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching church info:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/info - Atualiza informações da igreja
router.put('/', (req: Request, res: Response) => {
  try {
    const { name, address, city, state, phone, email, pastor_name, service_times, about, welcome_message } = req.body;

    db.prepare(`
      UPDATE church_info SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        pastor_name = COALESCE(?, pastor_name),
        service_times = COALESCE(?, service_times),
        about = COALESCE(?, about),
        welcome_message = COALESCE(?, welcome_message),
        updated_at = datetime('now', '-3 hours')
      WHERE id = 1
    `).run(
      name || null,
      address || null,
      city || null,
      state || null,
      phone || null,
      email || null,
      pastor_name || null,
      service_times ? JSON.stringify(service_times) : null,
      about || null,
      welcome_message || null
    );

    const updated = db.prepare('SELECT * FROM church_info WHERE id = 1').get();
    return res.json({ success: true, data: updated, message: 'Informações atualizadas com sucesso!' });
  } catch (error) {
    console.error('Error updating church info:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;