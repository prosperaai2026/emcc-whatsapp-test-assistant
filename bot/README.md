# PROSPERA AI - WhatsApp Bot

Este é o bot de WhatsApp para a Igreja EMCC, construído com Node.js e TypeScript.

## Funcionalidades
- **Boas-vindas e Menu Principal**: Interação inicial com o usuário.
- **Agenda**: Consulta de eventos e cultos.
- **Informações**: Dados sobre a igreja.
- **Pedido de Oração**: Fluxo para registro de pedidos.
- **Cadastro de Visitante**: Fluxo para capturar dados de novos visitantes.
- **Falar com Líder**: Encaminhamento para atendimento humano.
- **Inteligência Artificial**: Interpretação de intenções via OpenAI GPT.

## Tecnologias
- Node.js
- TypeScript
- Express (Webhook)
- Evolution API (Interface com WhatsApp)
- OpenAI (Processamento de Linguagem Natural)

## Como rodar
1. Instale as dependências: `npm install`
2. Configure o arquivo `.env` baseado no `.env.example`
3. Compile o projeto: `npm run build`
4. Inicie o servidor: `npm start`

Para desenvolvimento: `npm run dev`

## Estrutura do Projeto
- `src/index.ts`: Ponto de entrada do servidor Express.
- `src/webhook.ts`: Handler para eventos da Evolution API.
- `src/bot.ts`: Lógica de conversação e gerenciamento de estados.
- `src/ai.ts`: Integração com OpenAI para interpretação de intenção.
- `docs/ARCHITECTURE.md`: Documentação detalhada da arquitetura.
