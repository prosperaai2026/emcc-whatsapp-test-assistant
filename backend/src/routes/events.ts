import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { getUpcomingEvents, getTodayEvents, getThisWeekEvents, syncCalendarEvents } from '../services/google-calendar';

const router = Router();

// GET /api/events - Retorna próximos eventos (do cache local)
router.get('/', (req: Request, res: Response) => {
  try {
    const { period, limit } = req.query;
    const maxResults = limit ? parseInt(limit as string, 10) : 10;

    let events: any[];
    if (period === 'today') {
      events = getTodayEvents();
    } else if (period === 'week') {
      events = getThisWeekEvents();
    } else {
      events = getUpcomingEvents(maxResults);
    }

    return res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/events/sync - Força sincronização com Google Calendar
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const count = await syncCalendarEvents();
    return res.json({ success: true, data: { synced: count }, message: `${count} eventos sincronizados!` });
  } catch (error) {
    console.error('Error syncing events:', error);
    return res.status(500).json({ success: false, error: 'Erro ao sincronizar com Google Calendar. Verifique as credenciais.' });
  }
});

// POST /api/events - Cria um evento manual
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, start_time, end_time, location, event_type } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: title, start_time, end_time' });
    }

    const validTypes = ['culto', 'evento', 'reuniao', 'outro'];
    const type = event_type && validTypes.includes(event_type) ? event_type : 'evento';

    const result = db.prepare(`
      INSERT INTO calendar_events (title, description, start_time, end_time, location, event_type, source)
      VALUES (?, ?, ?, ?, ?, ?, 'manual')
    `).run(title, description || null, start_time, end_time, location || null, type);

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, data: event, message: 'Evento criado com sucesso!' });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/events/:id - Remove um evento manual
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado' });
    }

    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Evento removido com sucesso!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;