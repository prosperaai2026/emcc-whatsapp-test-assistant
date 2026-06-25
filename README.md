# PROSPERA AI - EMCC WhatsApp Assistant

Assistente inteligente via WhatsApp para igrejas.
Cliente piloto: **Igreja EMCC**

## Estrutura

```
├── backend/     → API REST + SQLite + Google Calendar (Express/TypeScript)
├── dashboard/   → Painel admin web (Next.js/React)
└── bot/         → WhatsApp Bot (Evolution API + OpenAI)
```

## Stack

- **Backend:** Node.js, TypeScript, Express 5, SQLite, Google Calendar API
- **Dashboard:** Next.js 15, React, Tailwind CSS, shadcn/ui
- **Bot:** Evolution API, OpenAI, TypeScript
- **Deploy:** Railway, Vercel

## Setup

```bash
cd backend && npm install && npm run dev   # API em :3001
cd dashboard && npm install && npm run dev # Painel em :3000
cd bot && npm install && npm run dev       # Bot
```
