from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
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
    database_url: str = Field(
        default_factory=lambda: f"sqlite+aiosqlite:///{Path.cwd() / 'url_shortener.db'}"
    )
    valkey_url: str | None = None
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
        ]
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value):
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("[") and stripped.endswith("]"):
                return value
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    def normalized_base_domain(self) -> str:
        return self.base_domain.rstrip("/")

    def get_database_url_async(self) -> str:
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
