# Deploying to Railway

This repo is a **pnpm workspace** (monorepo) with two deployable apps:

| App | Package | Type | What it does |
|-----|---------|------|--------------|
| API server | `@workspace/api-server` | Express (Node) | REST API under `/api`, health at `/api/healthz` |
| Portfolio  | `@workspace/belinda-portfolio` | Vite static site | The portfolio frontend + Socratic chat demo |

Both are deployed as **separate Railway services from the same GitHub repo**. The
build/start commands live in per-service config files:

- `artifacts/api-server/railway.toml`
- `artifacts/belinda-portfolio/railway.toml`

Because the workspace must install from the repo root, **each service uses Root
Directory `/`** and points to its own config file (steps below).

---

## 1. Create the project

1. In Railway, **New Project → Deploy from GitHub repo** → pick `hazvineyi1/BelindaMusoni`.
2. (Optional but recommended) **New → Database → PostgreSQL** to back the API.

## 2. API service

1. On the service created from the repo, open **Settings**.
2. **Source → Root Directory:** `/`
3. **Config-as-code / Railway Config File:** `artifacts/api-server/railway.toml`
4. **Variables** (Settings → Variables):
   - `AI_INTEGRATIONS_OPENAI_BASE_URL` = `https://api.openai.com/v1` (or your OpenAI-compatible gateway)
   - `AI_INTEGRATIONS_OPENAI_API_KEY` = your OpenAI API key
   - `DATABASE_URL` = reference the Postgres plugin (`${{Postgres.DATABASE_URL}}`) — needed for DB features
   - `NODE_ENV` = `production`
   - `PORT` is injected automatically by Railway — **do not set it**.
5. **Networking → Generate Domain** to get the public API URL (e.g. `https://belinda-api.up.railway.app`).
   The health check is configured at `/api/healthz`.

## 3. Portfolio service

1. **New → GitHub Repo** (same repo) to add a second service, or **New → Empty Service** linked to the repo.
2. **Settings → Source → Root Directory:** `/`
3. **Config File:** `artifacts/belinda-portfolio/railway.toml`
4. **Variables:**
   - `VITE_API_URL` = the API service's public URL from step 2.5 (no trailing slash).
     This is a **build-time** variable — Vite inlines it, so a redeploy is needed if it changes.
   - `BASE_PATH` = `/` (optional; defaults to `/`)
   - `PORT` is injected automatically — do not set it.
5. **Generate Domain** for the public site.

## 4. Database schema (first deploy)

The schema is managed with Drizzle. After the Postgres DB and `DATABASE_URL` exist, push the schema once:

```bash
# locally, with DATABASE_URL pointing at the Railway Postgres
pnpm install
DATABASE_URL="postgres://..." pnpm --filter @workspace/db run push
```

(You can also run this from a Railway one-off shell.)

---

## Environment variables summary

**API service**
- `AI_INTEGRATIONS_OPENAI_BASE_URL` (required for the chat routes)
- `AI_INTEGRATIONS_OPENAI_API_KEY` (required for the chat routes)
- `DATABASE_URL` (required for DB-backed features and `drizzle push`)
- `NODE_ENV=production`
- `PORT` (auto)

**Portfolio service**
- `VITE_API_URL` (build-time; the API service URL)
- `BASE_PATH=/` (optional)
- `PORT` (auto)

## Local development

```bash
corepack enable
pnpm install
# API (defaults to port 5000 via the dev script, or set PORT)
PORT=8080 pnpm --filter @workspace/api-server run dev
# Portfolio
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/belinda-portfolio run dev
```

When the frontend and API run on the same origin (or via a dev proxy), leave
`VITE_API_URL` unset and API calls stay relative (`/api/...`).
