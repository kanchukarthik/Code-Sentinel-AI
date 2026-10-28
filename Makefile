.PHONY: help setup seed test dev-backend dev-frontend dev docker-up docker-down

help:
	@echo "CodeSentinel AI - Multi-Agent Autonomous Software Engineering System"
	@echo ""
	@echo "Usage:"
	@echo "  make setup         - Install backend and frontend dependencies"
	@echo "  make seed          - Populate SQLite database with projects & historical telemetry"
	@echo "  make test          - Run full pytest test suite (16 tests)"
	@echo "  make dev-backend   - Start FastAPI server at http://localhost:8000"
	@echo "  make dev-frontend  - Start Vite dev dashboard at http://localhost:5173"
	@echo "  make docker-up     - Start complete platform via Docker Compose"
	@echo "  make docker-down   - Stop Docker Compose services"

setup:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt
	npm install

seed:
	cd backend && .venv/bin/python seed.py

test:
	cd backend && .venv/bin/pytest tests -v

dev-backend:
	cd backend && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	npm run dev

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
