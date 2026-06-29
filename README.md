# Belinda Musoni Portfolio

A pnpm workspace containing a portfolio site and its supporting API.

## Apps

- `artifacts/belinda-portfolio` — Vite + React portfolio frontend (includes the Socratic chat demo).
- `artifacts/api-server` — Express 5 API server (routes under `/api`, health at `/api/healthz`).
- `artifacts/mockup-sandbox` — internal mockup/preview tool (not deployed).

## Shared packages (`lib/`)

- `api-spec` — OpenAPI spec; `api-zod` / `api-client-react` are generated from it (Orval).
- `db` — PostgreSQL access via Drizzle ORM (`DATABASE_URL`).
- `integrations-openai-ai-server` — OpenAI client used by the chat routes.

## Run & operate

```bash
corepack enable          # provides pnpm (pinned via packageManager)
pnpm install
pnpm run typecheck       # typecheck all packages
pnpm --filter @workspace/api-server run dev          # API (set PORT)
pnpm --filter @workspace/belinda-portfolio run dev   # frontend (set PORT, BASE_PATH)
pnpm --filter @workspace/db run push                 # push DB schema (dev)
```

Required env: `DATABASE_URL` (Postgres), `AI_INTEGRATIONS_OPENAI_BASE_URL`,
`AI_INTEGRATIONS_OPENAI_API_KEY`.

## Stack

pnpm workspaces · Node.js 24 · TypeScript 5.9 · Express 5 · PostgreSQL + Drizzle ·
Zod · Orval codegen · esbuild (API bundle) · Vite + React + Tailwind (frontend).

## Deployment

Deployed on **Railway** (two services from this repo). See [RAILWAY.md](./RAILWAY.md)
for full setup, config files, and environment variables.
