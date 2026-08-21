import { env } from '../config/env.js';
import { SendTextPayload } from '../types/evolution.js';

export class EvolutionService {
  private static readonly baseUrl = env.EVOLUTION_API_URL;
  private static readonly apiKey = env.EVOLUTION_API_KEY;
  private static readonly instance = env.EVOLUTION_INSTANCE_NAME;

  public static async sendTextMessage(number: string, text: string): Promise<boolean> {
    const url = `${this.baseUrl}/message/sendText/${this.instance}`;

    const payload: SendTextPayload = {
      number,
      text,
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: false
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao enviar mensagem (${response.status}):`, errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com a Evolution API:', error);
      return false;
    }
  }
}