# URL Shortener

A complete FastAPI URL shortener with short-link creation, redirects, analytics, listing, deletion, and simple in-memory rate limiting.

## Run locally

### Backend only

```bash
pip install -r requirements.txt
uvicorn url_shortener.main:app --reload
```

### Frontend dashboard

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the FastAPI backend at `http://localhost:8000` by default. Override this with `VITE_API_BASE_URL` if needed.

### Docker Compose

```bash
cd infra
docker compose up
```

This starts:

- FastAPI backend on `http://localhost:8000`
- Vite frontend on `http://localhost:3000`

## API endpoints

- `POST /api/v1/shorten` - create a short URL.
- `GET /api/v1/shorten` - list all short URLs.
- `DELETE /api/v1/shorten/{short_code}` - deactivate a short URL.
- `GET /api/v1/analytics/{short_code}` - retrieve click analytics.
- `GET /{short_code}` - redirect to the original URL.
- `GET /health` - health check.
