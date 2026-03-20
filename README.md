# URL Shortener

A complete FastAPI URL shortener with short-link creation, redirects, analytics, listing, deletion, and simple in-memory rate limiting.

## Run locally

```bash
pip install -r requirements.txt
uvicorn url_shortener.main:app --reload
```

## API endpoints

- `POST /api/v1/shorten` - create a short URL.
- `GET /api/v1/shorten` - list all short URLs.
- `DELETE /api/v1/shorten/{short_code}` - deactivate a short URL.
- `GET /api/v1/analytics/{short_code}` - retrieve click analytics.
- `GET /{short_code}` - redirect to the original URL.
- `GET /health` - health check.
