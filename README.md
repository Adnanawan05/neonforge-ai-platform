# NeonForge AI Platform (Website)

A **website** experience (single-page, scroll sections) with a real backend: upload data → watch AI pipeline → get graphs + exports.

## Run locally (no Docker)

### 1) Start API (FastAPI)
```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Start Website (Next.js)
```bash
cd apps/web
npm i
npm run dev
```

Open:
- Website: http://localhost:3000
- API docs: http://localhost:8000/docs

## Optional (Docker)
```bash
docker compose up --build
```
