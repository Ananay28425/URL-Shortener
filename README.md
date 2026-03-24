# URL Shortener

A complete FastAPI URL shortener with short-link creation, redirects, analytics, listing, deletion, and simple in-memory rate limiting.

## Configuration

The application reads settings from environment variables or a local `.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `URL Shortener` | FastAPI application title. |
| `APP_VERSION` | `1.0.0` | API version string. |
| `DEBUG` | `false` | Enables debug-friendly behavior where applicable. |
| `API_V1_PREFIX` | `/api/v1` | Prefix applied to versioned API routes. |
| `BASE_DOMAIN` | `http://localhost:8000` | Base URL used when building shortened links. |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/url_shortener` | Async SQLAlchemy connection string used by `scripts/init_db.py`. |
| `VALKEY_URL` | `redis://localhost:6379/0` | Valkey/Redis connection string used by `scripts/init_db.py`. |
| `SHORT_CODE_LENGTH` | `6` | Default generated short-code length. |
| `MAX_SHORT_CODE_LENGTH` | `10` | Maximum supported short-code length. |
| `DEFAULT_URL_TTL_DAYS` | `365` | Default URL lifetime in days. |
| `ANONYMOUS_RATE_LIMIT` | `30` | Anonymous request limit per window. |
| `DEFAULT_RATE_LIMIT` | `100` | Default authenticated-user rate limit setting. |
| `RATE_LIMIT_WINDOW` | `3600` | Rate-limit window in seconds. |
| `ALLOWED_ORIGINS` | `["http://localhost:3000", "http://localhost:8080"]` | CORS origins list for the API. |

## Run locally

```bash
pip install -r requirements.txt
uvicorn url_shortener.main:app --reload
```

## Initialize backing services

If you want to create the database schema and verify Valkey connectivity, run:

```bash
python scripts/init_db.py
```

## API endpoints

- `POST /api/v1/shorten` - create a short URL.
- `GET /api/v1/shorten` - list all short URLs.
- `DELETE /api/v1/shorten/{short_code}` - deactivate a short URL.
- `GET /api/v1/analytics/{short_code}` - retrieve click analytics.
- `GET /{short_code}` - redirect to the original URL.
- `GET /health` - health check.
