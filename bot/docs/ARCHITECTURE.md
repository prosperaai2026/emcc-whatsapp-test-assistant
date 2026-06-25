# WhatsApp Bot Architecture - PROSPERA AI

## 1. Choice of API: Evolution API
We have chosen the **Evolution API** (https://evolution-api.com/) for the following reasons:
- **Multi-device support**: Allows churches to keep using their physical WhatsApp phones while the bot is active.
- **Scalability**: Can handle multiple instances (one per church) within a single server.
- **Rich Features**: Supports buttons, lists, and various media types out of the box.
- **Ease of Integration**: Provides a REST API that is easy to consume from Node.js.

## 2. Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js (for webhooks)
- **State Management**: Redis (planned for session handling)
- **Natural Language**: OpenAI GPT-3.5/4 (planned for intent interpretation)

## 3. Conversation Flows
### A. Welcome & Main Menu
- Triggered on first message.
- Options: 1. Agenda, 2. Informações, 3. Pedido de Oração, 4. Sou Visitante, 5. Falar com Líder.

### B. Agenda
- Fetches upcoming events from Backend API.
- Displays list of cults/events for the week.

### C. Informações
- Static or dynamic info about the church (address, pastors, times).

### D. Pedido de Oração
- Conversational flow:
  1. Ask for the prayer request.
  2. Ask for the name (if not known).
  3. Send to Backend API.

### E. Sou Visitante
- Conversational flow:
  1. Ask for Name.
  2. Ask for Phone (can be pre-filled).
  3. Ask for City.
  4. Ask for any specific request/interest.
  5. Send to Backend API.

### F. Falar com Líder
- Human handoff: Notify leadership via a specific channel or just provide a direct link.

## 4. Components
- **Webhook Handler**: Receives messages from Evolution API.
- **Flow Engine**: Manages the state of each conversation (step-by-step).
- **Service Layer**: Communicates with the Backend API.
- **AI Agent**: Interprets natural language when the user doesn't follow the menu.
