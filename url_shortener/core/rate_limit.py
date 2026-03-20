from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from typing import Deque, Dict

from fastapi import HTTPException, Request, status

from url_shortener.core.config import Settings


class InMemoryRateLimiter:
    """Simple fixed-window rate limiter used for anonymous clients."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._requests: Dict[str, Deque[datetime]] = defaultdict(deque)

    async def enforce(self, request: Request) -> None:
        identifier = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "anonymous")
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=self.settings.rate_limit_window)
        timestamps = self._requests[identifier]

        while timestamps and timestamps[0] < window_start:
            timestamps.popleft()

        if len(timestamps) >= self.settings.anonymous_rate_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )

        timestamps.append(now)
