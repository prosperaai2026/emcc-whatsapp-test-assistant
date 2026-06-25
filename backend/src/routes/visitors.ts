import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// GET /api/visitors - Lista visitantes (com paginação)
router.get('/', (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const maxResults = limit ? parseInt(limit as string, 10) : 50;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const visitors = db.prepare(`
      SELECT * FROM visitors ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(maxResults, skip);

    const total = db.prepare('SELECT COUNT(*) as count FROM visitors').get() as { count: number };

    return res.json({ success: true, data: visitors, total: total.count });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/visitors - Cadastra um visitante
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, phone, city, prayer_request, how_they_found_us } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: name, phone' });
    }

    const result = db.prepare(`
      INSERT INTO visitors (name, phone, city, prayer_request, how_they_found_us)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, phone, city || null, prayer_request || null, how_they_found_us || null);

    const visitor = db.prepare('SELECT * FROM visitors WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: visitor, message: 'Visitante cadastrado com sucesso! 🙏' });
  } catch (error) {
    console.error('Error creating visitor:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/visitors/today - Visitantes de hoje
router.get('/today', (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visitors = db.prepare(`
      SELECT * FROM visitors WHERE visited_at >= ? ORDER BY visited_at DESC
    `).all(today.toISOString());

    return res.json({ success: true, data: visitors, count: visitors.length });
  } catch (error) {
    console.error('Error fetching today visitors:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/visitors/:id - Detalhes de um visitante
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visitor = db.prepare('SELECT * FROM visitors WHERE id = ?').get(id);

    if (!visitor) {
      return res.status(404).json({ success: false, error: 'Visitante não encontrado' });
    }

    return res.json({ success: true, data: visitor });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;