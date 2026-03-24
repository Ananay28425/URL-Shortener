from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
import logging
from typing import Any, AsyncGenerator, Callable, TypeVar

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

logger = logging.getLogger(__name__)
T = TypeVar("T")


class DatabaseManager:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = None
        self.sync_engine = None
        self.session_factory = None
        self.sync_session_factory = None

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    async def initialize(self) -> None:
        """Initialize database engine and session factory."""
        if self.is_sqlite:
            sync_database_url = self.database_url.replace("+aiosqlite", "")
            self.sync_engine = create_engine(
                sync_database_url,
                echo=False,
                pool_pre_ping=True,
                connect_args={"check_same_thread": False},
            )
            self.sync_session_factory = sessionmaker(
                bind=self.sync_engine,
                class_=Session,
                expire_on_commit=False,
            )
        else:
            self.engine = create_async_engine(
                self.database_url,
                echo=False,
                pool_pre_ping=True,
                pool_size=20,
                max_overflow=30,
                pool_recycle=3600,
            )
            self.session_factory = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )

        await self._test_connection()
        logger.info("Database initialized successfully")

    async def _test_connection(self) -> None:
        """Test database connection."""
        try:
            if self.is_sqlite:
                await self.run_sync(lambda session: session.execute(text("SELECT 1")))
            else:
                async with self.engine.begin() as conn:
                    await conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            raise

    async def create_tables(self) -> None:
        """Create all tables."""
        from .models import Base

        if self.is_sqlite:
            await asyncio.to_thread(Base.metadata.create_all, self.sync_engine)
        else:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")

    async def close(self) -> None:
        """Close database connections."""
        if self.engine:
            await self.engine.dispose()
            self.engine = None
            self.session_factory = None
        if self.sync_engine:
            await asyncio.to_thread(self.sync_engine.dispose)
            self.sync_engine = None
            self.sync_session_factory = None
        logger.info("Database connections closed")

    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get async database session with automatic cleanup."""
        if not self.session_factory:
            raise RuntimeError("Async database not initialized. Call initialize() first.")

        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception as e:
                await session.rollback()
                logger.error(f"Database session error: {e}")
                raise
            finally:
                await session.close()

    async def run_sync(self, operation: Callable[[Session], T]) -> T:
        """Run synchronous session work in a thread for sqlite-backed tests/dev."""
        if not self.sync_session_factory:
            raise RuntimeError("Sync database not initialized. Call initialize() first.")

        def runner() -> T:
            session = self.sync_session_factory()
            try:
                result = operation(session)
                session.commit()
                return result
            except Exception:
                session.rollback()
                raise
            finally:
                session.close()

        return await asyncio.to_thread(runner)

    async def execute_raw_sql(self, query: str, params: dict | None = None) -> Any:
        """Execute raw SQL query."""
        if self.is_sqlite:
            return await self.run_sync(lambda session: session.execute(text(query), params or {}))

        async with self.get_session() as session:
            return await session.execute(text(query), params or {})

    async def health_check(self) -> bool:
        """Check database health."""
        try:
            await self._test_connection()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False


# Global database instance
db_manager = DatabaseManager("")


async def get_database() -> DatabaseManager:
    """Get database manager instance."""
    return db_manager


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI to get database session."""
    async with db_manager.get_session() as session:
        yield session
