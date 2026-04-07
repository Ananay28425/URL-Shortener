from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from url_shortener.api.ai import router as ai_router
from url_shortener.api.analytics import router as analytics_router
from url_shortener.api.redirect import router as redirect_router
from url_shortener.api.shorten import router as shorten_router
from url_shortener.core.config import get_settings
from url_shortener.core.rate_limit import NoOpRateLimiter, RateLimiter, ValkeyRateLimiter
from url_shortener.db.postgres import db_manager
from url_shortener.db.valkey import valkey_manager
from url_shortener.repositories.analytics_repository import AnalyticsRepository
from url_shortener.repositories.url_repository import URLRepository
from url_shortener.services.analytics_service import AnalyticsService
from url_shortener.services.redirect_service import RedirectService
from url_shortener.services.url_service import URLService


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    db_manager.database_url = settings.get_database_url_async()
    await db_manager.initialize()
    await db_manager.create_tables()

    rate_limiter: RateLimiter = NoOpRateLimiter()
    if settings.valkey_url:
        valkey_manager.valkey_url = settings.valkey_url
        await valkey_manager.initialize()
        rate_limiter = ValkeyRateLimiter(settings, valkey_manager)

    url_repository = URLRepository(db_manager)
    analytics_repository = AnalyticsRepository(db_manager)
    url_service = URLService(settings, url_repository)
    analytics_service = AnalyticsService(analytics_repository)

    app.state.settings = settings
    app.state.url_service = url_service
    app.state.analytics_service = analytics_service
    app.state.redirect_service = RedirectService(url_service, analytics_service)
    app.state.rate_limiter = rate_limiter

    try:
        yield
    finally:
        if settings.valkey_url:
            await valkey_manager.close()
        await db_manager.close()


app = FastAPI(title="URL Shortener", version="1.0.0", lifespan=lifespan)
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "URL Shortener is running",
        "docs": "/docs",
    }


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(shorten_router, prefix=settings.api_v1_prefix)
app.include_router(analytics_router, prefix=settings.api_v1_prefix)
app.include_router(ai_router, prefix=settings.api_v1_prefix)
app.include_router(redirect_router)
