import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// GET /api/prayer-requests - Lista pedidos de oração
router.get('/', (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const maxResults = limit ? parseInt(limit as string, 10) : 50;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const prayers = db.prepare(`
      SELECT * FROM prayer_requests ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(maxResults, skip);

    const total = db.prepare('SELECT COUNT(*) as count FROM prayer_requests').get() as { count: number };

    return res.json({ success: true, data: prayers, total: total.count });
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/prayer-requests - Registra pedido de oração
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, phone, request, is_anonymous } = req.body;

    if (!name || !phone || !request) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: name, phone, request' });
    }

    const anonymous = is_anonymous ? 1 : 0;

    const result = db.prepare(`
      INSERT INTO prayer_requests (name, phone, request, is_anonymous)
      VALUES (?, ?, ?, ?)
    `).run(name, phone, request, anonymous);

    const prayer = db.prepare('SELECT * FROM prayer_requests WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: prayer, message: 'Pedido de oração registrado! 🙏' });
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/prayer-requests/:id/prayed - Marcar como orado
router.put('/:id/prayed', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prayer = db.prepare('SELECT * FROM prayer_requests WHERE id = ?').get(id);

    if (!prayer) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }

    db.prepare('UPDATE prayer_requests SET prayed_for = prayed_for + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM prayer_requests WHERE id = ?').get(id);

    return res.json({ success: true, data: updated, message: 'Oração registrada! 🙌' });
  } catch (error) {
    console.error('Error updating prayer count:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/prayer-requests/stats - Estatísticas
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(prayed_for) as total_prayed,
        COUNT(CASE WHEN DATE(created_at) = DATE('now', '-3 hours') THEN 1 END) as today
      FROM prayer_requests
    `).get();

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching prayer stats:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;