from fastapi import Request
from fastapi.responses import RedirectResponse

from url_shortener.services.analytics_service import AnalyticsService
from url_shortener.services.url_service import URLService


class RedirectService:
    """Resolves short codes and records click analytics."""

    def __init__(self, url_service: URLService, analytics_service: AnalyticsService):
        self.url_service = url_service
        self.analytics_service = analytics_service

    async def redirect(self, short_code: str, request: Request) -> RedirectResponse:
        record = await self.url_service.increment_clicks(short_code)
        await self.analytics_service.track_click(record, request)
        return RedirectResponse(url=record.original_url, status_code=307)
