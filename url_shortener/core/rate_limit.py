from __future__ import annotations

from typing import Protocol

from fastapi import HTTPException, Request, status

from url_shortener.core.config import Settings
from url_shortener.db.valkey import ValkeyManager


class RateLimiter(Protocol):
    async def enforce(self, request: Request) -> None:
        ...


class NoOpRateLimiter:
    async def enforce(self, request: Request) -> None:
        return None


class ValkeyRateLimiter:
    """Shared fixed-window rate limiter backed by Valkey."""

    def __init__(self, settings: Settings, valkey_manager: ValkeyManager):
        self.settings = settings
        self.valkey_manager = valkey_manager

    async def enforce(self, request: Request) -> None:
        identifier = request.headers.get("x-forwarded-for") or (
            request.client.host if request.client else "anonymous"
        )
        is_allowed, _ = await self.valkey_manager.rate_limit_check(
            identifier=identifier,
            limit=self.settings.anonymous_rate_limit,
            window=self.settings.rate_limit_window,
        )
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )
