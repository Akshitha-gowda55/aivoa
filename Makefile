.PHONY: db-up db-down frontend backend frontend-install backend-install test-frontend test-backend lint-frontend

db-up:
	docker compose up -d

db-down:
	docker compose down

frontend-install:
	cd frontend && npm install

backend-install:
	cd backend && python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt

frontend:
	cd frontend && npm run dev

backend:
	cd backend && python -m uvicorn app.main:app --reload --port 8000

test-frontend:
	cd frontend && npm test

test-backend:
	cd backend && python -m pytest

lint-frontend:
	cd frontend && npm run lint && npm run typecheck
