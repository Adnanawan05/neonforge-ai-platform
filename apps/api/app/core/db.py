from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker
from sqlalchemy import text

from app.core.config import settings

engine: AsyncEngine | None = None
SessionLocal: async_sessionmaker | None = None


def _to_async_url(url: str) -> str:
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "sqlite+aiosqlite:///")
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://")
    return url


async def init_db():
    global engine, SessionLocal
    if engine is not None:
        return
    engine = create_async_engine(_to_async_url(settings.database_url), future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    # minimal schema
    async with engine.begin() as conn:
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            phase TEXT,
            progress REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            payload_json TEXT,
            result_json TEXT,
            error_json TEXT
        );
        """))
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL,
            ts TEXT NOT NULL,
            level TEXT NOT NULL,
            phase TEXT,
            message TEXT NOT NULL,
            data_json TEXT
        );
        """))
