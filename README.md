# WhatsApp Business Delivery Bot Engine

Engine de automação e chatbot para WhatsApp Business integrado a plataformas de delivery (iFood e 99Food). O projeto foi desenvolvido com foco em modularidade, desempenho e boas práticas de DevOps.

## Arquitetura

A aplicação opera de forma orientada a eventos, recebendo webhooks da Evolution API e orquestrando o atendimento em um servidor Node.js com Fastify:

```text
[ Cliente WhatsApp ]
        |
        v
[ Evolution API (Docker) ] -- Baileys / WhatsApp Web Protocol
        |
        v POST /webhook
[ Fastify Webhook Server ]
        |
        +--> Validacao de payloads e configuracoes (Zod)
        +--> Bot Engine (estados e horario comercial)
        +--> Fetch API nativo --> Resposta ao cliente ou alerta ao atendente
```

## Funcionalidades

- **Roteamento de delivery:** direcionamento para as páginas do iFood e 99Food.
- **Redes sociais:** divulgação integrada de Instagram e TikTok.
- **Horário comercial:** resposta personalizada fora do expediente.
- **Transbordo humano:** pausa do bot e alerta ao gestor quando o cliente solicita atendimento.
- **Expiração de sessão:** encerramento automático de atendimentos inativos após um período configurável.
- **HTTP nativo:** comunicação externa feita com a Fetch API do Node.js, sem dependências HTTP adicionais.

## Stack tecnológica

- Node.js 24 LTS
- TypeScript 5 com modo estrito
- Fastify 5
- Zod 4 para validação de tipos e ambiente
- `tsx` para desenvolvimento
- Evolution API v2.3.7 via Docker
- PostgreSQL 16 e Redis 7

## Pré-requisitos

- Node.js 24 ou superior e npm
- Docker e Docker Compose

## Execução local

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/whatsapp-bot-engine.git
   cd whatsapp-bot-engine
   ```

2. Suba a infraestrutura:

   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

3. Crie o arquivo local de ambiente:

   ```bash
   cp .env.example .env
   ```

4. Revise o `.env`, principalmente as credenciais e o número do gestor.

5. Instale as dependências e inicie o servidor:

   ```bash
   npm install
   npm run dev
   ```

Para gerar e executar a versão de produção:

```bash
npm run build
npm start
```

## Variáveis de ambiente

Todas as variáveis são validadas com Zod durante o boot. Os valores padrão estão definidos em `src/config/env.ts`.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor HTTP. |
| `HOST` | `0.0.0.0` | Interface de rede do servidor. |
| `NODE_ENV` | `development` | Ambiente de execução. |
| `EVOLUTION_API_URL` | `http://localhost:8080` | URL da Evolution API. |
| `EVOLUTION_API_KEY` | `B0T_S3CR3T_K3Y_2026` | Chave de autenticação da Evolution API. |
| `EVOLUTION_INSTANCE_NAME` | `delivery-bot` | Nome da instância do WhatsApp. |
| `IFOOD_URL` | `https://www.ifood.com.br` | Link do iFood. |
| `FOOD99_URL` | `https://food.99app.com` | Link do 99Food. |
| `INSTAGRAM_URL` | `https://instagram.com` | Link do Instagram. |
| `TIKTOK_URL` | `https://tiktok.com` | Link do TikTok. |
| `ADMIN_WHATSAPP_NUMBER` | `5500000000000` | Número do gestor com código do país. |
| `OPENING_HOUR` | `11` | Hora de abertura, no formato 24 horas. |
| `CLOSING_HOUR` | `20` | Hora de fechamento, no formato 24 horas. |
| `SESSION_TIMEOUT_MINUTES` | `15` | Tempo de expiração da sessão humana. |

> **Importante:** os valores padrão são apenas para desenvolvimento. Troque a chave da Evolution API e o número do gestor antes de qualquer uso real.

## Endpoints

### `GET /health`

Retorna o estado atual do servidor:

```json
{
  "status": "healthy",
  "timestamp": "2026-08-21T12:00:00.000Z"
}
```

### `POST /webhook`

Recebe eventos `messages.upsert` enviados pela Evolution API. Mensagens do próprio bot e mensagens de grupos são ignoradas.

## Scripts npm

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento com recarga automática. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm start` | Executa o servidor compilado. |

## Segurança e organização

- Não versione o arquivo `.env`; use `.env.example` como referência.
- Não mantenha credenciais padrão em ambientes compartilhados ou de produção.
- A configuração é validada durante o boot para evitar execução com valores inválidos.
- A infraestrutura fica em `docker/`, os tipos em `src/types/`, os serviços em `src/services/` e o entrypoint em `src/server.ts`.
