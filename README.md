# WhatsApp Business Delivery Bot Engine

Automation and chatbot engine for WhatsApp Business integrated with delivery platforms (iFood and 99Food). The project was developed with a focus on modularity, performance, and DevOps best practices.

## Architecture

The application follows an event-driven architecture, receiving webhooks from the Evolution API and orchestrating customer service through a Node.js server built with Fastify:

```text
[ Cliente WhatsApp ]
        |
        v
[ Evolution API (Docker) ] -- Baileys / WhatsApp Web Protocol
        |
        v POST /webhook
[ Fastify Webhook Server ]
        |
      +--> Payload and configuration validation (Zod)
      +--> Bot Engine (states and business hours)
      +--> Native Fetch API --> Customer response or staff alert
```

## Features

- **Delivery routing:** direct links to iFood and 99Food pages.
- **Social media:** integrated Instagram and TikTok promotion.
- **Business hours:** customized responses outside operating hours.
- **Human handoff:** pauses the bot and alerts the manager when a customer requests human assistance.
- **Session expiration:** automatically closes inactive sessions after a configurable period.
- **Native HTTP:** external communication through Node.js's Fetch API, without additional HTTP dependencies.

## Technology stack

- Node.js 24 LTS
- TypeScript 5 with strict mode
- Fastify 5
- Zod 4 for type and environment validation
- `tsx` for development
- Evolution API v2.3.7 via Docker
- PostgreSQL 16 and Redis 7

## Prerequisites

- Node.js 24 or later and npm
- Docker e Docker Compose

## Local setup

1. Clone the repository:

   ```bash
   git clone https://github.com/seu-usuario/whatsapp-bot-engine.git
   cd whatsapp-bot-engine
   ```

2. Start the infrastructure:

   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

3. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

4. Review `.env`, especially the credentials and manager's phone number.

5. Install the dependencies and start the server:

   ```bash
   npm install
   npm run dev
   ```

To build and run the production version:

```bash
npm run build
npm start
```

## Environment variables

All variables are validated with Zod during startup. Default values are defined in `src/config/env.ts`.

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port. |
| `HOST` | `0.0.0.0` | Server network interface. |
| `NODE_ENV` | `development` | Runtime environment. |
| `EVOLUTION_API_URL` | `http://localhost:8080` | Evolution API URL. |
| `EVOLUTION_API_KEY` | `B0T_S3CR3T_K3Y_2026` | Evolution API authentication key. |
| `EVOLUTION_INSTANCE_NAME` | `delivery-bot` | WhatsApp instance name. |
| `IFOOD_URL` | `https://www.ifood.com.br` | iFood link. |
| `FOOD99_URL` | `https://food.99app.com` | 99Food link. |
| `INSTAGRAM_URL` | `https://instagram.com` | Instagram link. |
| `TIKTOK_URL` | `https://tiktok.com` | TikTok link. |
| `ADMIN_WHATSAPP_NUMBER` | `5500000000000` | Manager's phone number, including the country code. |
| `OPENING_HOUR` | `11` | Opening hour in 24-hour format. |
| `CLOSING_HOUR` | `20` | Closing hour in 24-hour format. |
| `SESSION_TIMEOUT_MINUTES` | `15` | Human-support session expiration time. |

> **Important:** default values are intended for development only. Replace the Evolution API key and manager's phone number before any real-world use.

## Endpoints

### `GET /health`

Returns the current server status:

```json
{
  "status": "healthy",
  "timestamp": "2026-08-21T12:00:00.000Z"
}
```

### `POST /webhook`

Receives `messages.upsert` events sent by the Evolution API. Messages sent by the bot itself and group messages are ignored.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the server in development mode with automatic reload. |
| `npm run build` | Compiles TypeScript to `dist/`. |
| `npm start` | Runs the compiled server. |

## Security and organization

- Do not commit `.env`; use `.env.example` as a reference.
- Do not keep default credentials in shared or production environments.
- Configuration is validated during startup to prevent execution with invalid values.
- Infrastructure is located in `docker/`, types in `src/types/`, services in `src/services/`, and the entry point in `src/server.ts`.
