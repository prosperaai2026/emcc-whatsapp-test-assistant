import db from './connection';

export function initializeDatabase(): void {
  db.exec(`
    -- Tabela: Informações da Igreja
    CREATE TABLE IF NOT EXISTS church_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      address TEXT,
      city TEXT,
      state TEXT,
      phone TEXT,
      email TEXT,
      pastor_name TEXT,
      service_times TEXT, -- JSON: {"domingo": ["08:00","19:00"], "quarta": ["20:00"]}
      about TEXT,
      welcome_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Tabela: Visitantes
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      prayer_request TEXT,
      how_they_found_us TEXT,
      visited_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Tabela: Pedidos de Oração
    CREATE TABLE IF NOT EXISTS prayer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      request TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      prayed_for INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Tabela: Liderança
    CREATE TABLE IF NOT EXISTS leaders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      department TEXT,
      birth_date TEXT, -- formato: '1990-08-15'
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Tabela: Eventos/Calendário
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_event_id TEXT UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT,
      event_type TEXT NOT NULL DEFAULT 'evento' CHECK(event_type IN ('culto','evento','reuniao','outro')),
      is_recurring INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual' CHECK(source IN ('google_calendar','manual')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Tabela: Base de Conhecimento (FAQ)
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      keywords TEXT, -- JSON array
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '-3 hours'))
    );

    -- Índices para otimização
    CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);
    CREATE INDEX IF NOT EXISTS idx_visitors_created ON visitors(created_at);
    CREATE INDEX IF NOT EXISTS idx_prayer_requests_phone ON prayer_requests(phone);
    CREATE INDEX IF NOT EXISTS idx_prayer_requests_created ON prayer_requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_leaders_active ON leaders(is_active);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_time);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_google_id ON calendar_events(google_event_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
  `);

  // Seed church_info with default data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM church_info').get() as { count: number };
  if (count.count === 0) {
    db.prepare(`
      INSERT INTO church_info (name, address, city, state, phone, email, pastor_name, service_times, about, welcome_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Minha Igreja',
      'Endereço da Igreja',
      'Cidade',
      'Estado',
      '(00) 0000-0000',
      'contato@igreja.com',
      'Pastor',
      JSON.stringify({ domingo: ['08:00', '19:00'], quarta: ['20:00'] }),
      'Bem-vindo à nossa igreja!',
      'Que alegria ter você aqui! 🙏'
    );
    console.log('✅ church_info seeded with default data');
  }

  console.log('✅ Database tables initialized');
}