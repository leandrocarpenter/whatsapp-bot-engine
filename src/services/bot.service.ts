import { env } from '../config/env.js';
import { EvolutionService } from './evolution.service.js';

interface UserSession {
  inHumanHandover: boolean;
  lastInteraction: Date;
}

// Armazena o estado e o timestamp da última mensagem de cada cliente
const userSessions = new Map<string, UserSession>();

export class BotService {
  public static async handleIncomingMessage(sender: string, clientName: string, text: string): Promise<void> {
    const cleanText = text.trim().toLowerCase();
    const now = new Date();

    // 1. Verificação de Sessão e Timeout
    const session = userSessions.get(sender);
    if (session && session.inHumanHandover) {
      const diffMinutes = (now.getTime() - session.lastInteraction.getTime()) / (1000 * 60);

      // Se passou do tempo limite ou o cliente digitou comando de reset
      if (diffMinutes > env.SESSION_TIMEOUT_MINUTES || cleanText === '#menu' || cleanText === '#reiniciar') {
        userSessions.delete(sender);
      } else {
        // Atualiza a última interação e não interrompe o atendente humano
        session.lastInteraction = now;
        return;
      }
    }

    // 2. Verificação de Horário de Atendimento
    if (!this.isBusinessHours()) {
      await this.sendClosedMessage(sender, clientName);
      return;
    }

    // 3. Roteamento de Opções
    switch (cleanText) {
      case '1':
      case 'cardapio':
      case 'cardápio':
      case 'fazer pedido':
      case 'pedido':
        await this.sendDeliveryMenu(sender, clientName);
        break;

      case '2':
      case 'redes':
      case 'redes sociais':
        await this.sendSocialMedia(sender);
        break;

      case '3':
      case 'atendente':
      case 'humano':
      case 'suporte':
        await this.handleHumanAttendant(sender, clientName);
        break;

      default:
        await this.sendMainMenu(sender, clientName);
        break;
    }
  }

  private static isBusinessHours(): boolean {
    // Obtém a hora atual de Brasília
    const brHour = parseInt(
      new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        hour12: false
      }).format(new Date())
    );

    return brHour >= env.OPENING_HOUR && brHour < env.CLOSING_HOUR;
  }

  private static async sendClosedMessage(to: string, clientName: string): Promise<void> {
    const message = 
      `Olá, *${clientName}*! Obrigado por entrar em contato com o *Delícias da Lú*.\n\n` +
      `⏰ No momento estamos *fechados*. Nosso horário de atendimento é de *${env.OPENING_HOUR}h às ${env.CLOSING_HOUR}h*.\n\n` +
      `Você ainda pode conferir nosso cardápio no iFood e agendar seu pedido:\n` +
      `🔴 *iFood:* ${env.IFOOD_URL}`;

    await EvolutionService.sendTextMessage(to, message);
  }

  private static async sendMainMenu(to: string, clientName: string): Promise<void> {
    const message = 
      `Olá, *${clientName}*! Seja muito bem-vindo(a) ao *Delícias da Lú*!\n\n` +
      `Como podemos te ajudar hoje? Digite o número da opção:\n\n` +
      `1️⃣ *Fazer Pedido / Ver Cardápio (iFood & 99Food)*\n` +
      `2️⃣ *Conhecer Nossas Redes Sociais*\n` +
      `3️⃣ *Falar com Atendente Humano*`;

    await EvolutionService.sendTextMessage(to, message);
  }

  private static async sendDeliveryMenu(to: string, clientName: string): Promise<void> {
    const message = 
      `Perfeito, *${clientName}*! Escolha a sua plataforma de delivery favorita para fazer o pedido:\n\n` +
      `🔴 *iFood:*\n${env.IFOOD_URL}\n\n` +
      `🟡 *99Food:*\n${env.FOOD99_URL}\n\n` +
      `--------------------------------\n` +
      `✨ _Já conhece as nossas redes sociais? Acesse, siga e compartilhe as novidades:_\n` +
      `📸 *Instagram:* ${env.INSTAGRAM_URL}\n` +
      `🎵 *TikTok:* ${env.TIKTOK_URL}\n\n` +
      `_Digite *3* caso precise falar com um atendente._`;

    await EvolutionService.sendTextMessage(to, message);
  }

  private static async sendSocialMedia(to: string): Promise<void> {
    const message = 
      `✨ *Acompanhe o Delícias da Lú nas Redes Sociais!*\n\n` +
      `Acesse, siga e fique por dentro de todas as promoções e novidades:\n\n` +
      `📸 *Instagram:* ${env.INSTAGRAM_URL}\n` +
      `🎵 *TikTok:* ${env.TIKTOK_URL}\n\n` +
      `_Digite *1* para fazer um pedido ou *3* para falar com atendente._`;

    await EvolutionService.sendTextMessage(to, message);
  }

  private static async handleHumanAttendant(to: string, clientName: string): Promise<void> {
    userSessions.set(to, {
      inHumanHandover: true,
      lastInteraction: new Date()
    });

    const clientMessage = 
      `Prontinho, *${clientName}*! Um de nossos atendentes foi notificado e logo entrará em contato com você por aqui.\n\n` +
      `_Caso queira reativar o menu automático a qualquer momento, digite *#menu*._`;
    
    await EvolutionService.sendTextMessage(to, clientMessage);

    const adminMessage = 
      `🚨 *[ALERTA DE ATENDIMENTO HUMANO]*\n\n` +
      `O cliente *${clientName}* solicitou um atendente.\n` +
      `📱 *WhatsApp do Cliente:* https://wa.me/${to}\n` +
      `⏰ *Horário:* ${new Date().toLocaleTimeString('pt-BR')}`;

    await EvolutionService.sendTextMessage(env.ADMIN_WHATSAPP_NUMBER, adminMessage);
  }
}