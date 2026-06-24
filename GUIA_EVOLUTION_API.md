# Guia de Integração: Evolution API + EMCC Assistant

Este guia explica como conectar sua instância da Evolution API a este assistente.

## 1. Configuração na Evolution API

### Passo 1: Criar/Usar uma Instância
Certifique-se de ter uma instância ativa na sua Evolution API e que o WhatsApp esteja conectado (QR Code lido).

### Passo 2: Configurar o Webhook
No painel da Evolution API ou via API:
1. Vá nas configurações da instância.
2. Localize a seção **Webhooks**.
3. Configure os seguintes campos:
   - **URL do Webhook**: `https://seu-servidor.com/webhook` (Substitua pela URL onde você fez o deploy deste projeto).
   - **Eventos**: Selecione `MESSAGES_UPSERT`.
   - **Status**: Ativado.

## 2. Configuração deste Assistente (.env)

No seu servidor (Railway, Render, etc), configure as seguintes variáveis de ambiente:

- `WHATSAPP_API_URL`: A URL base da sua Evolution API (ex: `https://api.suadominio.com`).
- `WHATSAPP_API_KEY`: A `apikey` da sua instância ou a Global da Evolution API.
- `WHATSAPP_INSTANCE_NAME`: O nome da instância que você criou na Evolution API.
- `PORT`: 3000 (ou a porta padrão do seu serviço de deploy).

## 3. Como funciona o fluxo

1. **Recebimento**: Quando alguém envia uma mensagem para o WhatsApp da igreja, a Evolution API dispara um evento `MESSAGES_UPSERT` para a rota `/webhook` deste servidor.
2. **Processamento**: Este servidor extrai o texto da mensagem e verifica se contém as palavras-chave (agenda, endereço).
3. **Resposta**: 
   - O servidor envia uma requisição `POST` para a Evolution API no endpoint `/message/sendText/{instanceName}`.
   - A Evolution API entrega a mensagem de resposta ao usuário final no WhatsApp.

## 4. Testando a Conexão

Você pode usar o Dashboard (acessando a URL raiz do projeto) para verificar se as mensagens estão chegando e sendo respondidas. 

O Dashboard mostra:
- Status do servidor.
- Log das últimas mensagens recebidas.
- Resposta enviada automaticamente.
