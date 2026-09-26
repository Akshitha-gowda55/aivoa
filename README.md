# AIVOA AI Deviation Management

AI-powered deviation intake workflow for an API pharmaceutical manufacturing environment.

This repository currently contains **project foundation and architecture only**. Intake, AI extraction, impact/severity assessment, and persistence are not implemented yet.

## Current setup

- Frontend: React, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS
- Backend: FastAPI, Pydantic v2
- Database: PostgreSQL (SQLAlchemy 2.x and Alembic configured; no deviation tables yet)
- Containers: Docker Compose for PostgreSQL
- Planned AI: LangGraph + Groq (dependencies reserved as optional extras; not wired)

## Prerequisites

- Node.js 20+
- Python 3.12+ (the API package metadata requires 3.12; the current machine used for local verification had Python 3.10)
- Docker Desktop (or another Docker Compose runtime)

## Environment variables

Copy the example file and keep secrets out of source control:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | Application environment name |
| `DATABASE_URL` | SQLAlchemy URL for PostgreSQL |
| `GROQ_API_KEY` | Reserved for later AI work; leave empty for now |
| `CORS_ORIGINS` | Allowed frontend origins |
| `VITE_API_BASE_URL` | Frontend API base (defaults to `http://localhost:8000/api/v1`) |

Do not commit `.env` files. Logging redacts database credentials and API keys.

## How to start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL is exposed on `localhost:5432`. Data is stored in the named volume `aivoa_postgres_data`.

## How to start the backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/api/v1/health
```

Expected:

```json
{"status":"ok","service":"aivoa-deviation-api"}
```

Placeholder routes:

- `GET /api/v1/deviations` → `{"message":"Not implemented yet"}`
- `GET /api/v1/ai` → `{"message":"Not implemented yet"}`

## How to start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

Placeholder routes:

- `/dashboard`
- `/deviations`
- `/deviations/new`
- `/deviations/:id`

## Project structure

```text
aivoa-deviation-management/
├── frontend/          React + Vite application
├── backend/           FastAPI application
├── docker-compose.yml PostgreSQL service
├── Makefile           Common development commands
└── README.md
```

## Development commands

| Command | Description |
| --- | --- |
| `docker compose up -d` | Start PostgreSQL |
| `cd frontend && npm run dev` | Start the Vite dev server |
| `cd backend && uvicorn app.main:app --reload --port 8000` | Start FastAPI |
| `cd frontend && npm run lint` | ESLint |
| `cd frontend && npm run typecheck` | TypeScript project build check |
| `make db-up` | Same as Docker Compose up (requires `make`) |

Alembic is configured under `backend/alembic`. There are no model migrations yet.

## Testing commands

```bash
cd frontend && npm test
cd backend && python -m pytest
```

Playwright is installed for later end-to-end coverage (`npm run test:e2e`). No e2e specs are included in this foundation.

## What is intentionally not included

- AI extraction, LangGraph nodes, or Groq calls
- Deviation database models
- Severity or impact algorithms
- Authentication
- Dashboard analytics
- File/PDF processing
- Production deployment
