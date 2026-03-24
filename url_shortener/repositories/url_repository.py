from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from url_shortener.db.models import URL
from url_shortener.db.postgres import DatabaseManager
from url_shortener.models.schemas import URLRecord


class URLRepository:
    """Database-backed data access for shortened URLs."""

    def __init__(self, database: DatabaseManager):
        self.database = database

    async def create_url(
        self,
        *,
        short_code: str,
        original_url: str,
        created_at: datetime,
        expires_at: datetime | None,
        custom_alias: str | None,
    ) -> URLRecord:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._create_url_sync(
                    session,
                    short_code=short_code,
                    original_url=original_url,
                    created_at=created_at,
                    expires_at=expires_at,
                    custom_alias=custom_alias,
                )
            )

        async with self.database.get_session() as session:
            url = URL(
                short_code=short_code,
                original_url=original_url,
                created_at=created_at,
                expires_at=expires_at,
                custom_alias=custom_alias,
            )
            session.add(url)
            try:
                await session.flush()
            except IntegrityError:
                raise
            await session.refresh(url)
            return self._to_record(url)

    async def list_urls(self) -> list[URLRecord]:
        if self.database.is_sqlite:
            return await self.database.run_sync(self._list_urls_sync)

        async with self.database.get_session() as session:
            result = await session.execute(select(URL).order_by(URL.created_at.desc()))
            return [self._to_record(url) for url in result.scalars().all()]

    async def get_by_short_code(self, short_code: str) -> URLRecord | None:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._get_by_short_code_sync(session, short_code)
            )

        async with self.database.get_session() as session:
            result = await session.execute(select(URL).where(URL.short_code == short_code))
            url = result.scalar_one_or_none()
            return self._to_record(url) if url else None

    async def short_code_exists(self, short_code: str) -> bool:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._short_code_exists_sync(session, short_code)
            )

        async with self.database.get_session() as session:
            result = await session.execute(
                select(URL.id).where(URL.short_code == short_code).limit(1)
            )
            return result.scalar_one_or_none() is not None

    async def set_url_active_state(self, short_code: str, is_active: bool) -> URLRecord | None:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._set_active_state_sync(session, short_code, is_active)
            )

        async with self.database.get_session() as session:
            result = await session.execute(select(URL).where(URL.short_code == short_code))
            url = result.scalar_one_or_none()
            if url is None:
                return None
            url.is_active = is_active
            await session.flush()
            await session.refresh(url)
            return self._to_record(url)

    async def increment_clicks(self, short_code: str) -> URLRecord | None:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._increment_clicks_sync(session, short_code)
            )

        async with self.database.get_session() as session:
            result = await session.execute(select(URL).where(URL.short_code == short_code))
            url = result.scalar_one_or_none()
            if url is None:
                return None
            url.click_count += 1
            await session.flush()
            await session.refresh(url)
            return self._to_record(url)

    def _create_url_sync(
        self,
        session,
        *,
        short_code: str,
        original_url: str,
        created_at: datetime,
        expires_at: datetime | None,
        custom_alias: str | None,
    ) -> URLRecord:
        url = URL(
            short_code=short_code,
            original_url=original_url,
            created_at=created_at,
            expires_at=expires_at,
            custom_alias=custom_alias,
        )
        session.add(url)
        session.flush()
        session.refresh(url)
        return self._to_record(url)

    def _list_urls_sync(self, session) -> list[URLRecord]:
        result = session.execute(select(URL).order_by(URL.created_at.desc()))
        return [self._to_record(url) for url in result.scalars().all()]

    def _get_by_short_code_sync(self, session, short_code: str) -> URLRecord | None:
        result = session.execute(select(URL).where(URL.short_code == short_code))
        url = result.scalar_one_or_none()
        return self._to_record(url) if url else None

    def _short_code_exists_sync(self, session, short_code: str) -> bool:
        result = session.execute(select(URL.id).where(URL.short_code == short_code).limit(1))
        return result.scalar_one_or_none() is not None

    def _set_active_state_sync(self, session, short_code: str, is_active: bool) -> URLRecord | None:
        result = session.execute(select(URL).where(URL.short_code == short_code))
        url = result.scalar_one_or_none()
        if url is None:
            return None
        url.is_active = is_active
        session.flush()
        session.refresh(url)
        return self._to_record(url)

    def _increment_clicks_sync(self, session, short_code: str) -> URLRecord | None:
        result = session.execute(select(URL).where(URL.short_code == short_code))
        url = result.scalar_one_or_none()
        if url is None:
            return None
        url.click_count += 1
        session.flush()
        session.refresh(url)
        return self._to_record(url)

    def _to_record(self, url: URL) -> URLRecord:
        return URLRecord(
            id=url.id,
            short_code=url.short_code,
            original_url=url.original_url,
            created_at=url.created_at,
            expires_at=url.expires_at,
            click_count=url.click_count,
            is_active=url.is_active,
            custom_alias=url.custom_alias,
        )
