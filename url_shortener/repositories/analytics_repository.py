from __future__ import annotations

from datetime import datetime

from sqlalchemy import delete, select

from url_shortener.db.models import Analytics, URL
from url_shortener.db.postgres import DatabaseManager
from url_shortener.models.schemas import ClickEvent


class AnalyticsRepository:
    """Database-backed analytics event storage."""

    def __init__(self, database: DatabaseManager):
        self.database = database

    async def create_event(
        self,
        *,
        url_id: int,
        timestamp: datetime,
        ip_address: str | None,
        referer: str | None,
        user_agent: str | None,
        country: str | None,
        city: str | None,
        browser: str | None,
        os_name: str | None,
        device_type: str,
    ) -> ClickEvent:
        if self.database.is_sqlite:
            return await self.database.run_sync(
                lambda session: self._create_event_sync(
                    session,
                    url_id=url_id,
                    timestamp=timestamp,
                    ip_address=ip_address,
                    referer=referer,
                    user_agent=user_agent,
                    country=country,
                    city=city,
                    browser=browser,
                    os_name=os_name,
                    device_type=device_type,
                )
            )

        async with self.database.get_session() as session:
            event = Analytics(
                url_id=url_id,
                timestamp=timestamp,
                ip_address=ip_address or "unknown",
                referer=referer,
                user_agent=user_agent,
                country=country,
                city=city,
                browser=browser,
                os=os_name,
                device_type=device_type,
            )
            session.add(event)
            await session.flush()
            await session.refresh(event)
            return self._to_click_event(event)

    async def list_events(self, url_id: int) -> list[ClickEvent]:
        if self.database.is_sqlite:
            return await self.database.run_sync(lambda session: self._list_events_sync(session, url_id))

        async with self.database.get_session() as session:
            result = await session.execute(
                select(Analytics)
                .where(Analytics.url_id == url_id)
                .order_by(Analytics.timestamp.desc())
            )
            return [self._to_click_event(event) for event in result.scalars().all()]

    async def delete_events_for_short_code(self, short_code: str) -> None:
        if self.database.is_sqlite:
            await self.database.run_sync(
                lambda session: self._delete_events_for_short_code_sync(session, short_code)
            )
            return

        async with self.database.get_session() as session:
            url_id_result = await session.execute(
                select(URL.id).where(URL.short_code == short_code).limit(1)
            )
            url_id = url_id_result.scalar_one_or_none()
            if url_id is None:
                return
            await session.execute(delete(Analytics).where(Analytics.url_id == url_id))

    def _create_event_sync(
        self,
        session,
        *,
        url_id: int,
        timestamp: datetime,
        ip_address: str | None,
        referer: str | None,
        user_agent: str | None,
        country: str | None,
        city: str | None,
        browser: str | None,
        os_name: str | None,
        device_type: str,
    ) -> ClickEvent:
        event = Analytics(
            url_id=url_id,
            timestamp=timestamp,
            ip_address=ip_address or "unknown",
            referer=referer,
            user_agent=user_agent,
            country=country,
            city=city,
            browser=browser,
            os=os_name,
            device_type=device_type,
        )
        session.add(event)
        session.flush()
        session.refresh(event)
        return self._to_click_event(event)

    def _list_events_sync(self, session, url_id: int) -> list[ClickEvent]:
        result = session.execute(
            select(Analytics).where(Analytics.url_id == url_id).order_by(Analytics.timestamp.desc())
        )
        return [self._to_click_event(event) for event in result.scalars().all()]

    def _delete_events_for_short_code_sync(self, session, short_code: str) -> None:
        url_id_result = session.execute(select(URL.id).where(URL.short_code == short_code).limit(1))
        url_id = url_id_result.scalar_one_or_none()
        if url_id is None:
            return
        session.execute(delete(Analytics).where(Analytics.url_id == url_id))

    def _to_click_event(self, event: Analytics) -> ClickEvent:
        return ClickEvent(
            timestamp=event.timestamp,
            ip_address=event.ip_address,
            referer=event.referer,
            user_agent=event.user_agent,
            country=event.country,
            city=event.city,
            browser=event.browser,
            os=event.os,
            device_type=event.device_type or "desktop",
        )
