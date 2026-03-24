from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Request

from url_shortener.models.schemas import AnalyticsAggregate, ClickEvent, URLRecord
from url_shortener.repositories.analytics_repository import AnalyticsRepository


class AnalyticsService:
    """Collects click metadata for shortened URLs."""

    def __init__(self, repository: AnalyticsRepository) -> None:
        self.repository = repository

    async def track_click(self, url: URLRecord, request: Request) -> ClickEvent:
        user_agent = request.headers.get("user-agent")
        referer = request.headers.get("referer")
        forwarded_for = request.headers.get("x-forwarded-for")
        ip_address = None
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        elif request.client:
            ip_address = request.client.host

        device_type = self._detect_device(user_agent)
        browser = self._detect_browser(user_agent)
        os_name = self._detect_os(user_agent)

        return await self.repository.create_event(
            url_id=url.id,
            timestamp=datetime.now(timezone.utc),
            ip_address=ip_address,
            referer=referer,
            user_agent=user_agent,
            country=None,
            city=None,
            browser=browser,
            os_name=os_name,
            device_type=device_type,
        )

    async def get_analytics(self, url: URLRecord) -> AnalyticsAggregate:
        return AnalyticsAggregate(url=url, clicks=await self.repository.list_events(url.id))

    async def delete_analytics(self, short_code: str) -> None:
        await self.repository.delete_events_for_short_code(short_code)

    def _detect_device(self, user_agent: str | None) -> str:
        agent = (user_agent or "").lower()
        if any(token in agent for token in ("iphone", "android", "mobile")):
            return "mobile"
        if "ipad" in agent or "tablet" in agent:
            return "tablet"
        return "desktop"

    def _detect_browser(self, user_agent: str | None) -> str:
        agent = (user_agent or "").lower()
        if "firefox" in agent:
            return "firefox"
        if "edg" in agent:
            return "edge"
        if "chrome" in agent:
            return "chrome"
        if "safari" in agent:
            return "safari"
        return "unknown"

    def _detect_os(self, user_agent: str | None) -> str:
        agent = (user_agent or "").lower()
        if "windows" in agent:
            return "windows"
        if "mac os" in agent or "macintosh" in agent:
            return "macos"
        if "linux" in agent:
            return "linux"
        if "android" in agent:
            return "android"
        if "iphone" in agent or "ios" in agent:
            return "ios"
        return "unknown"
