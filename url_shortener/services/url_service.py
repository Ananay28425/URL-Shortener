from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from url_shortener.core.config import Settings
from url_shortener.models.schemas import URLCreateRequest, URLRecord
from url_shortener.repositories.url_repository import URLRepository
from url_shortener.utils.id_generator import get_id_generator


class URLService:
    """Coordinates URL persistence and domain rules."""

    def __init__(self, settings: Settings, repository: URLRepository):
        self.settings = settings
        self.repository = repository
        self._generator = get_id_generator()

    async def create_short_url(self, payload: URLCreateRequest) -> URLRecord:
        short_code = payload.custom_alias or await self._generate_unique_code()
        if await self.repository.short_code_exists(short_code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Short code already exists",
            )

        expires_at = None
        if payload.expires_in_days is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(days=payload.expires_in_days)

        try:
            return await self.repository.create_url(
                short_code=short_code,
                original_url=str(payload.url),
                created_at=datetime.now(timezone.utc),
                expires_at=expires_at,
                custom_alias=payload.custom_alias,
            )
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Short code already exists",
            ) from exc

    async def list_urls(self) -> list[URLRecord]:
        return await self.repository.list_urls()

    async def get_url(self, short_code: str) -> URLRecord | None:
        return await self.repository.get_by_short_code(short_code)

    async def require_active_url(self, short_code: str) -> URLRecord:
        record = await self.get_url(short_code)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")
        if not record.is_active:
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Short URL is inactive")
        if record.expires_at and record.expires_at <= datetime.now(timezone.utc):
            await self.repository.set_url_active_state(short_code, False)
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Short URL has expired")
        return record

    async def delete_url(self, short_code: str) -> None:
        record = await self.get_url(short_code)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")
        await self.repository.set_url_active_state(short_code, False)

    async def increment_clicks(self, short_code: str) -> URLRecord:
        await self.require_active_url(short_code)
        record = await self.repository.increment_clicks(short_code)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")
        return record

    async def _generate_unique_code(self) -> str:
        async def exists(candidate: str) -> bool:
            return await self.repository.short_code_exists(candidate)

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
