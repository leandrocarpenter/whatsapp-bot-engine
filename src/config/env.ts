import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  EVOLUTION_API_URL: z.string().url().default('http://localhost:8080'),
  EVOLUTION_API_KEY: z.string().min(1).default('B0T_S3CR3T_K3Y_2026'),
  EVOLUTION_INSTANCE_NAME: z.string().min(1).default('delivery-bot'),

  IFOOD_URL: z.string().url().default('https://www.ifood.com.br'),
  FOOD99_URL: z.string().url().default('https://food.99app.com'),

  INSTAGRAM_URL: z.string().url().default('https://instagram.com'),
  TIKTOK_URL: z.string().url().default('https://tiktok.com'),

  ADMIN_WHATSAPP_NUMBER: z.string().min(10).default('5500000000000'),

  // Horário de Funcionamento (Formato 24h)
  OPENING_HOUR: z.coerce.number().default(11),
  CLOSING_HOUR: z.coerce.number().default(20),

  // Tempo de expiração do atendimento humano (em minutos)
  SESSION_TIMEOUT_MINUTES: z.coerce.number().default(15)
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Erro de validação no .env:', _env.error.format());
  throw new Error('Variáveis de ambiente inválidas.');
}

export const env = _env.data;