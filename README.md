# EMCC WhatsApp Assistant (Versão Evolution API)

Este projeto é um assistente automatizado para o WhatsApp da igreja EMCC (Port Charlotte, FL), projetado para trabalhar em conjunto com a **Evolution API**.

O assistente responde automaticamente a perguntas frequentes sobre a **agenda** e o **endereço** da igreja, garantindo um atendimento imediato.

## 🚀 Funcionalidades

- **Respostas Automáticas**: Identifica palavras-chave como "agenda" e "endereço".
- **Integração Nativa**: Feito para funcionar com os Webhooks e Endpoints da Evolution API.
- **Dashboard de Controle**: Interface web simples para monitorar status e histórico de mensagens.
- **Leve e Rápido**: Construído com Node.js e Express.

## 📋 Pré-requisitos

- Node.js 18 ou superior.
- Uma instância ativa da [Evolution API](https://evolution-api.com/).

## 🛠️ Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/emcc-whatsapp-test-assistant.git
   cd emcc-whatsapp-test-assistant
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Copie o arquivo de exemplo e edite com suas credenciais:
   ```bash
   cp .env.example .env
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

## 🌐 Configuração do Webhook

Para que o assistente receba mensagens, você deve configurar o Webhook na Evolution API apontando para:
`https://sua-url.com/webhook`

Veja o [Guia Completo da Evolution API](./GUIA_EVOLUTION_API.md) para detalhes passo a passo.

## 📡 Endpoints da API

### Webhook (Recebimento)
- **POST `/webhook`**: Recebe o payload `MESSAGES_UPSERT` da Evolution API.

### Envio de Mensagens (Saída)
O servidor se comunica com a Evolution API via:
- **POST `{WHATSAPP_API_URL}/message/sendText/{INSTANCE}`**
- Headers: `apikey: {SUA_CHAVE}`

## 🚀 Deploy

Este projeto está pronto para ser hospedado no **Railway**, **Render** ou qualquer serviço de Node.js.
Certifique-se de configurar as Variáveis de Ambiente no painel do seu serviço de hospedagem.

---
**EMCC - Port Charlotte, Florida**
*Automatizando o amor e a informação.*
