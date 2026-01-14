"""Database configuration and session management."""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all models."""

    pass


# Async engine for API endpoints
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Sync engine for background tasks (avoids greenlet issues)
# Convert async URL to sync URL
if "sqlite+aiosqlite:" in settings.database_url:
    # SQLite: aiosqlite -> sqlite
    sync_database_url = settings.database_url.replace("sqlite+aiosqlite:", "sqlite:")
elif "postgresql+asyncpg:" in settings.database_url:
    # PostgreSQL: asyncpg -> psycopg2
    sync_database_url = settings.database_url.replace("postgresql+asyncpg:", "postgresql+psycopg2:")
else:
    # Fallback: use as-is
    sync_database_url = settings.database_url

sync_engine = create_engine(
    sync_database_url,
    echo=False,
    pool_pre_ping=True,
)

sync_session = sessionmaker(
    sync_engine,
    expire_on_commit=False,
)


from contextlib import contextmanager
from typing import Generator
from sqlalchemy.orm import Session


@contextmanager
def get_sync_db() -> Generator[Session, None, None]:
    """
    Context manager for sync database sessions.

    Use this for background tasks to avoid greenlet issues with async SQLAlchemy.

    Example:
        with get_sync_db() as db:
            task = db.query(Task).filter_by(id=task_id).first()
            task.status = "done"
            db.commit()
    """
    session = sync_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """Dependency for getting database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
