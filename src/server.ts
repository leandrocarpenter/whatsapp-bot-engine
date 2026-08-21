import Fastify from 'fastify';
import { env } from './config/env.js';
import { WebhookMessagePayload } from './types/evolution.js';
import { BotService } from './services/bot.service.js';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn'
  }
});

app.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
});

app.post<{ Body: WebhookMessagePayload }>('/webhook', async (request, reply) => {
  const { body } = request;

  if (body?.event === 'messages.upsert' && body?.data) {
    const { key, message, pushName } = body.data;

    // Ignora mensagens enviadas pelo próprio bot ou de grupos
    if (key.fromMe || key.remoteJid.includes('@g.us')) {
      return reply.status(200).send({ ignored: true });
    }

    const text = message?.conversation || message?.extendedTextMessage?.text || '';
    const sender = key.remoteJid.replace('@s.whatsapp.net', '');
    const clientName = pushName ?? 'Cliente';

    app.log.info(`📩 [PROCESSANDO] De: ${clientName} (${sender}) | Texto: "${text}"`);

    // Processa a lógica de negócio e estados de forma assíncrona
    BotService.handleIncomingMessage(sender, clientName, text).catch(err => {
      app.log.error(err, 'Erro ao processar mensagem no BotService');
    });
  }

  return reply.status(200).send({ received: true });
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Webhook Server rodando em http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();