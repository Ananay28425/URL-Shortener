from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings for the URL shortener."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "URL Shortener"
    app_version: str = "1.0.0"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    base_domain: str = "http://localhost:8000"
    short_code_length: int = 6
    max_short_code_length: int = 10
    default_url_ttl_days: int = 365
    anonymous_rate_limit: int = 30
    default_rate_limit: int = 100
    rate_limit_window: int = 3600
    allowed_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:8080"]
    )

    def normalized_base_domain(self) -> str:
        return self.base_domain.rstrip("/")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
