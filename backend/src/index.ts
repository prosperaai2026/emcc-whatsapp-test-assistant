import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/schema';

// Import routes
import infoRouter from './routes/info';
import eventsRouter from './routes/events';
import visitorsRouter from './routes/visitors';
import prayersRouter from './routes/prayers';
import leadersRouter from './routes/leaders';
import birthdaysRouter from './routes/birthdays';
import knowledgeBaseRouter from './routes/knowledge-base';
import webhookRouter from "./routes/webhook";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// === Routes ===

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    success: true, 
    status: 'online', 
    service: 'PROSPERA AI - Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Church info
app.use('/api/info', infoRouter);

// Events (Google Calendar + manual)
app.use('/api/events', eventsRouter);

// Visitors
app.use('/api/visitors', visitorsRouter);

// Prayer requests
app.use('/api/prayer-requests', prayersRouter);

// Leaders
app.use('/api/leaders', leadersRouter);

// Birthdays
app.use('/api/birthdays', birthdaysRouter);

// Knowledge base (FAQ)
app.use('/api/knowledge-base', knowledgeBaseRouter);
app.use("/api/whatsapp/webhook", webhookRouter);

// Weekly report route
app.get('/api/reports/weekly', (_req, res) => {
  try {
    const db = require('./db/connection').default;
    
    // Week range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString();
    const weekEnd = sunday.toISOString();

    // Visitors this week
    const visitors = db.prepare(`
      SELECT COUNT(*) as count FROM visitors 
      WHERE visited_at >= ? AND visited_at <= ?
    `).get(weekStart, weekEnd);

    // Prayer requests this week
    const prayers = db.prepare(`
      SELECT COUNT(*) as count FROM prayer_requests 
      WHERE created_at >= ? AND created_at <= ?
    `).get(weekStart, weekEnd);

    // Upcoming events
    const events = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE start_time >= datetime('now', '-3 hours') 
      ORDER BY start_time ASC LIMIT 5
    `).all();

    // Birthdays this week (active leaders)
    const leaders = db.prepare(`
      SELECT * FROM leaders WHERE is_active = 1 AND birth_date IS NOT NULL
    `).all() as any[];

    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    const birthdays = leaders.filter((l: any) => {
      const bd = new Date(l.birth_date);
      const thisYear = new Date(new Date().getFullYear(), bd.getMonth(), bd.getDate());
      return thisYear >= monday && thisYear <= sunday;
    }).map((l: any) => {
      const bd = new Date(l.birth_date);
      return { ...l, birthday_formatted: `${bd.getDate()} de ${monthNames[bd.getMonth()]}` };
    });

    const report = {
      week: { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] },
      total_visitors: (visitors as any).count,
      total_prayer_requests: (prayers as any).count,
      upcoming_events: events,
      birthdays_this_week: birthdays,
    };

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return res.status(500).json({ success: false, error: 'Erro ao gerar relatório semanal' });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 PROSPERA AI Backend rodando em http://127.0.0.1:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API endpoints:`);
  console.log(`   GET    /api/info             - Informações da igreja`);
  console.log(`   PUT    /api/info             - Atualizar informações`);
  console.log(`   GET    /api/events           - Próximos eventos`);
  console.log(`   POST   /api/events           - Criar evento manual`);
  console.log(`   POST   /api/events/sync      - Sincronizar Google Calendar`);
  console.log(`   DELETE /api/events/:id       - Remover evento`);
  console.log(`   GET    /api/visitors         - Listar visitantes`);
  console.log(`   POST   /api/visitors         - Cadastrar visitante`);
  console.log(`   GET    /api/visitors/today   - Visitantes de hoje`);
  console.log(`   GET    /api/visitors/:id     - Detalhes do visitante`);
  console.log(`   GET    /api/prayer-requests  - Listar pedidos de oração`);
  console.log(`   POST   /api/prayer-requests  - Registrar pedido de oração`);
  console.log(`   PUT    /api/prayer-requests/:id/prayed - Orar por pedido`);
  console.log(`   GET    /api/prayer-requests/stats - Estatísticas de oração`);
  console.log(`   GET    /api/leaders          - Listar líderes`);
  console.log(`   POST   /api/leaders          - Cadastrar líder`);
  console.log(`   PUT    /api/leaders/:id      - Atualizar líder`);
  console.log(`   DELETE /api/leaders/:id      - Remover líder`);
  console.log(`   GET    /api/birthdays        - Aniversariantes da semana`);
  console.log(`   GET    /api/knowledge-base   - FAQ da igreja`);
  console.log(`   POST   /api/knowledge-base   - Criar FAQ`);
  console.log(`   PUT    /api/knowledge-base/:id - Atualizar FAQ`);
  console.log(`   DELETE /api/knowledge-base/:id - Remover FAQ`);
  console.log(`   POST   /api/knowledge-base/search - Buscar na FAQ`);
  console.log(`   GET    /api/reports/weekly  - Relatório semanal`);
  console.log(`\n✅ Servidor pronto!\n`);
});

export default app;
