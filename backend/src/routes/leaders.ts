import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// GET /api/leaders - Lista líderes
router.get('/', (req: Request, res: Response) => {
  try {
    const { department, active } = req.query;
    let query = 'SELECT * FROM leaders WHERE 1=1';
    const params: any[] = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (active === 'true') {
      query += ' AND is_active = 1';
    } else if (active === 'false') {
      query += ' AND is_active = 0';
    }

    query += ' ORDER BY name ASC';

    const leaders = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM leaders').get() as { count: number };

    return res.json({ success: true, data: leaders, total: total.count });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/leaders - Cadastra líder
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, phone, role, email, department, birth_date } = req.body;

    if (!name || !phone || !role) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: name, phone, role' });
    }

    const result = db.prepare(`
      INSERT INTO leaders (name, phone, role, email, department, birth_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, phone, role, email || null, department || null, birth_date || null);

    const leader = db.prepare('SELECT * FROM leaders WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: leader, message: 'Líder cadastrado com sucesso!' });
  } catch (error) {
    console.error('Error creating leader:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/leaders/:id - Atualiza líder
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, role, email, department, birth_date, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM leaders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Líder não encontrado' });
    }

    db.prepare(`
      UPDATE leaders SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        email = COALESCE(?, email),
        department = COALESCE(?, department),
        birth_date = COALESCE(?, birth_date),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now', '-3 hours')
      WHERE id = ?
    `).run(name || null, phone || null, role || null, email || null, department || null, birth_date || null, is_active !== undefined ? (is_active ? 1 : 0) : null, id);

    const updated = db.prepare('SELECT * FROM leaders WHERE id = ?').get(id);
    return res.json({ success: true, data: updated, message: 'Líder atualizado com sucesso!' });
  } catch (error) {
    console.error('Error updating leader:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/leaders/:id - Remove líder
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leaders WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Líder não encontrado' });
    }

    db.prepare('DELETE FROM leaders WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Líder removido com sucesso!' });
  } catch (error) {
    console.error('Error deleting leader:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;