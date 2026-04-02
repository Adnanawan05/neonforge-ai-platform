# NeonForge AI Platform

Cinematic, phase-wise AI data platform.

## Run (Docker)
```bash
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:8000/docs

## Local
```bash
cd apps/api && python -m venv .venv && .venv\\Scripts\\activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd ..\\web && npm i && npm run dev
```
