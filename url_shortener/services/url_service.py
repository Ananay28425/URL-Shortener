from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from fastapi import HTTPException, status

from url_shortener.core.config import Settings
from url_shortener.models.schemas import URLCreateRequest, URLRecord
from url_shortener.utils.id_generator import get_id_generator


class URLService:
    """Stores and manages shortened URLs in memory."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._urls: Dict[str, URLRecord] = {}
        self._generator = get_id_generator()

    async def create_short_url(self, payload: URLCreateRequest) -> URLRecord:
        short_code = payload.custom_alias or await self._generate_unique_code()
        if short_code in self._urls:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Short code already exists",
            )

        expires_at = None
        if payload.expires_in_days is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(days=payload.expires_in_days)

        record = URLRecord(
            short_code=short_code,
            original_url=str(payload.url),
            created_at=datetime.now(timezone.utc),
            expires_at=expires_at,
            custom_alias=payload.custom_alias,
        )
        self._urls[short_code] = record
        return record

    async def list_urls(self) -> List[URLRecord]:
        return sorted(self._urls.values(), key=lambda item: item.created_at, reverse=True)

    async def get_url(self, short_code: str) -> Optional[URLRecord]:
        return self._urls.get(short_code)

    async def require_active_url(self, short_code: str) -> URLRecord:
        record = await self.get_url(short_code)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")
        if not record.is_active:
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Short URL is inactive")
        if record.expires_at and record.expires_at <= datetime.now(timezone.utc):
            record.is_active = False
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Short URL has expired")
        return record

    async def delete_url(self, short_code: str) -> None:
        record = await self.get_url(short_code)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")
        record.is_active = False

    async def increment_clicks(self, short_code: str) -> URLRecord:
        record = await self.require_active_url(short_code)
        record.click_count += 1
        return record

    async def _generate_unique_code(self) -> str:
        async def exists(candidate: str) -> bool:
            return candidate in self._urls

        candidate = await self._generator.generate_collision_free(
            exists,
            length=self.settings.short_code_length,
        )
        if candidate is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to generate a unique short code",
            )
        return candidate
