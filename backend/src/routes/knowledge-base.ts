import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// GET /api/knowledge-base - Lista entradas da base de conhecimento (FAQ)
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, active, search } = req.query;
    let query = 'SELECT * FROM knowledge_base WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (active === 'true') {
      query += ' AND is_active = 1';
    } else if (active === 'false') {
      query += ' AND is_active = 0';
    }
    if (search) {
      query += ' AND (question LIKE ? OR answer LIKE ? OR keywords LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY category ASC, question ASC';

    const entries = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM knowledge_base').get() as { count: number };

    return res.json({ success: true, data: entries, total: total.count });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/knowledge-base/:id - Detalhes de uma entrada
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entrada não encontrada' });
    }

    return res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error fetching knowledge entry:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/knowledge-base - Cria entrada na base de conhecimento
router.post('/', (req: Request, res: Response) => {
  try {
    const { question, answer, category, keywords } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: question, answer' });
    }

    const keywordsJson = keywords ? JSON.stringify(keywords) : JSON.stringify([]);

    const result = db.prepare(`
      INSERT INTO knowledge_base (question, answer, category, keywords)
      VALUES (?, ?, ?, ?)
    `).run(question, answer, category || null, keywordsJson);

    const entry = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: entry, message: 'Entrada criada com sucesso!' });
  } catch (error) {
    console.error('Error creating knowledge entry:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/knowledge-base/:id - Atualiza entrada
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, category, keywords, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Entrada não encontrada' });
    }

    db.prepare(`
      UPDATE knowledge_base SET
        question = COALESCE(?, question),
        answer = COALESCE(?, answer),
        category = COALESCE(?, category),
        keywords = COALESCE(?, keywords),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now', '-3 hours')
      WHERE id = ?
    `).run(
      question || null,
      answer || null,
      category || null,
      keywords ? JSON.stringify(keywords) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);
    return res.json({ success: true, data: updated, message: 'Entrada atualizada com sucesso!' });
  } catch (error) {
    console.error('Error updating knowledge entry:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/knowledge-base/:id - Remove entrada
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Entrada não encontrada' });
    }

    db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Entrada removida com sucesso!' });
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/knowledge-base/search - Busca na base de conhecimento por texto
router.post('/search', (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Campo obrigatório: query' });
    }

    // Search by exact match, keyword, and partial text
    const searchTerm = `%${query}%`;
    const entries = db.prepare(`
      SELECT * FROM knowledge_base
      WHERE is_active = 1
        AND (
          question LIKE ? 
          OR answer LIKE ? 
          OR keywords LIKE ?
          OR category LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN question LIKE ? THEN 1
          WHEN keywords LIKE ? THEN 2
          ELSE 3
        END
      LIMIT 10
    `).all(searchTerm, searchTerm, searchTerm, searchTerm, `%${query}%`, `%${query}%`);

    return res.json({ success: true, data: entries, count: entries.length });
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;