from collections import Counter
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class URLCreateRequest(BaseModel):
    url: HttpUrl
    custom_alias: Optional[str] = Field(default=None, min_length=3, max_length=50)
    expires_in_days: Optional[int] = Field(default=None, ge=1, le=3650)

    @field_validator("custom_alias")
    @classmethod
    def validate_custom_alias(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_")
        if not set(value) <= allowed:
            raise ValueError(
                "custom_alias may contain only letters, numbers, hyphens, and underscores"
            )
        return value


class URLResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime]
    click_count: int


class URLSummary(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime]
    click_count: int
    is_active: bool


class ClickEvent(BaseModel):
    timestamp: datetime
    ip_address: Optional[str] = None
    referer: Optional[str] = None
    user_agent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    device_type: str = "desktop"


class AnalyticsResponse(BaseModel):
    short_code: str
    original_url: str
    short_url: str
    total_clicks: int
    last_clicked_at: Optional[datetime]
    top_referrers: Dict[str, int]
    browser_breakdown: Dict[str, int]
    device_breakdown: Dict[str, int]
    recent_clicks: List[ClickEvent]


class URLRecord(BaseModel):
    short_code: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    click_count: int = 0
    is_active: bool = True
    custom_alias: Optional[str] = None

    def to_response(self, base_domain: str) -> URLResponse:
        base = base_domain.rstrip("/")
        return URLResponse(
            short_code=self.short_code,
            short_url=f"{base}/{self.short_code}",
            original_url=self.original_url,
            created_at=self.created_at,
            expires_at=self.expires_at,
            click_count=self.click_count,
        )

    def to_summary(self, base_domain: str) -> URLSummary:
        base = base_domain.rstrip("/")
        return URLSummary(
            short_code=self.short_code,
            short_url=f"{base}/{self.short_code}",
            original_url=self.original_url,
            created_at=self.created_at,
            expires_at=self.expires_at,
            click_count=self.click_count,
            is_active=self.is_active,
        )


class AnalyticsAggregate(BaseModel):
    url: URLRecord
    clicks: List[ClickEvent]

    def to_response(self, base_domain: str) -> AnalyticsResponse:
        recent_clicks = sorted(self.clicks, key=lambda click: click.timestamp, reverse=True)[:20]
        top_referrers = Counter(click.referer or "direct" for click in self.clicks)
        browser_breakdown = Counter(click.browser or "unknown" for click in self.clicks)
        device_breakdown = Counter(click.device_type or "unknown" for click in self.clicks)
        last_clicked_at = recent_clicks[0].timestamp if recent_clicks else None
        base = base_domain.rstrip("/")
        return AnalyticsResponse(
            short_code=self.url.short_code,
            original_url=self.url.original_url,
            short_url=f"{base}/{self.url.short_code}",
            total_clicks=len(self.clicks),
            last_clicked_at=last_clicked_at,
            top_referrers=dict(top_referrers),
            browser_breakdown=dict(browser_breakdown),
            device_breakdown=dict(device_breakdown),
            recent_clicks=recent_clicks,
        )
