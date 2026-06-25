# PROSPERA AI - Backend API

Assistente inteligente via WhatsApp para igrejas.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Banco:** SQLite (better-sqlite3)
- **Integração:** Google Calendar API
- **Porta:** 3001 (loopback — frontend faz proxy via porta 3000)

## Setup

```bash
# Instalar dependências
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Desenvolvimento (hot reload)
npm run dev

# Produção
npm run build
npm start
```

## Variáveis de Ambiente (.env)

```
PORT=3001                          # Porta do servidor (loopback)
DATABASE_PATH=./data/church.db     # Caminho do SQLite
CORS_ORIGINS=*                     # Origens permitidas

# Google Calendar (via Service Account)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
# OU (alternativa sem arquivo):
# GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-sa@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# CALENDAR_ID=igreja@group.calendar.google.com
```

## Estrutura do Projeto

```
src/
├── index.ts                 # Entry point — Express, rotas, middlewares
├── db/
│   ├── connection.ts        # Conexão SQLite
│   └── schema.ts            # Inicialização das tabelas
├── routes/
│   ├── info.ts              # GET/PUT /api/info
│   ├── events.ts            # GET/POST/DELETE /api/events + sync
│   ├── visitors.ts          # GET/POST /api/visitors
│   ├── prayers.ts           # GET/POST /api/prayer-requests
│   ├── leaders.ts           # CRUD /api/leaders
│   ├── birthdays.ts         # GET /api/birthdays
│   └── knowledge-base.ts    # CRUD /api/knowledge-base + search
├── services/
│   └── google-calendar.ts   # Sincronização Google Calendar
└── types/
    └── index.ts             # Tipos TypeScript compartilhados
```