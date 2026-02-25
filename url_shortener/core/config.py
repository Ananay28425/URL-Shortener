from pydantic import BaseSettings, Field
from pydantic_settings import BaseSettings as PydanticBaseSettings
from typing import List, Optional
import os
from pathlib import Path

# Get project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(PydanticBaseSettings):
    """Application settings with environment-based configuration"""

    # Application
    app_name: str = "URL Shortener"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://user:password@localhost/urlshortener",
        env="DATABASE_URL",
    )
    database_pool_size: int = Field(default=20, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")

    # Valkey
    valkey_url: str = Field(default="valkey://localhost:6379", env="VALKEY_URL")
    valkey_max_connections: int = Field(default=20, env="VALKEY_MAX_CONNECTIONS")

    # Security
    secret_key: str = Field(
        default="your-secret-key-change-in-production", env="SECRET_KEY"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(
        default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    # API Configuration
    api_v1_prefix: str = "/api/v1"
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="ALLOWED_ORIGINS",
    )

    # Rate Limiting
    default_rate_limit: int = Field(
        default=100, env="DEFAULT_RATE_LIMIT"
    )  # requests per hour
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # seconds
    anonymous_rate_limit: int = Field(default=10, env="ANONYMOUS_RATE_LIMIT")

    # URL Configuration
    base_domain: str = Field(default="http://localhost:8000", env="BASE_DOMAIN")
    short_code_length: int = Field(default=6, env="SHORT_CODE_LENGTH")
    max_short_code_length: int = Field(default=10, env="MAX_SHORT_CODE_LENGTH")
    default_url_ttl_days: int = Field(default=365, env="DEFAULT_URL_TTL_DAYS")

    # File Upload (if needed for custom domains)
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    upload_dir: str = Field(default="uploads", env="UPLOAD_DIR")

    # Analytics
    analytics_batch_size: int = Field(default=100, env="ANALYTICS_BATCH_SIZE")
    analytics_flush_interval: int = Field(
        default=300, env="ANALYTICS_FLUSH_INTERVAL"
    )  # seconds

    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")

    # Monitoring
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=9090, env="METRICS_PORT")

    # ML/AI Configuration
    ml_api_endpoint: Optional[str] = Field(default=None, env="ML_API_ENDPOINT")
    ml_api_key: Optional[str] = Field(default=None, env="ML_API_KEY")
    enable_ml_features: bool = Field(default=False, env="ENABLE_ML_FEATURES")

    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"  # Allow extra fields from environment

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment.lower() == "development"

    def get_database_url_async(self) -> str:
        """Get async database URL"""
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
        return self.database_url

    def get_cors_origins(self) -> List[str]:
        """Get CORS origins list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(",")]
        return self.allowed_origins


class DatabaseSettings:
    """Database-specific settings"""

    @staticmethod
    def get_url(settings: Settings) -> str:
        """Get database URL"""
        return settings.get_database_url_async()

    @staticmethod
    def get_pool_config(settings: Settings) -> dict:
        """Get database pool configuration"""
        return {
            "pool_size": settings.database_pool_size,
            "max_overflow": settings.database_max_overflow,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
        }


class ValkeySettings:
    """Valkey-specific settings"""

    @staticmethod
    def get_url(settings: Settings) -> str:
        """Get Valkey URL"""
        return settings.valkey_url

    @staticmethod
    def get_connection_config(settings: Settings) -> dict:
        """Get Valkey connection configuration"""
        return {
            "max_connections": settings.valkey_max_connections,
            "retry_on_timeout": True,
            "socket_timeout": 5,
            "socket_connect_timeout": 5,
        }


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings


def get_database_settings() -> DatabaseSettings:
    """Get database settings"""
    return DatabaseSettings()


def get_valkey_settings() -> ValkeySettings:
    """Get Valkey settings"""
    return ValkeySettings()


# Environment-specific configurations
class DevelopmentSettings(Settings):
    """Development environment settings"""

    environment: str = "development"
    debug: bool = True
    log_level: str = "DEBUG"


class ProductionSettings(Settings):
    """Production environment settings"""

    environment: str = "production"
    debug: bool = False
    log_level: str = "WARNING"


class TestingSettings(Settings):
    """Testing environment settings"""

    environment: str = "testing"
    database_url: str = "sqlite+aiosqlite:///./test.db"
    redis_url: str = "redis://localhost:6379/1"
    debug: bool = True


def create_settings() -> Settings:
    """Create settings based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()

    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()


# Create and export settings
settings = create_settings()
