# URL Shortener

A minimal FastAPI backend prototype for shortening URLs, listing them, redirecting short codes, and collecting lightweight in-memory analytics.

## Evaluation scope decision

This repository currently matches a **minimal backend prototype**, not the larger production-style system previously described in `docs/system.md`.

The running application is limited to:
- FastAPI API routes for create/list/delete/redirect/analytics.
- In-memory URL storage for the life of a single process.
- In-memory click analytics derived from redirect requests.
- Simple in-memory anonymous rate limiting on URL creation.

It does **not** currently run the production-oriented modules that were previously documented, such as authentication, a React dashboard, PostgreSQL persistence, Valkey caching, GeoIP enrichment, or multi-instance deployment wiring.

## Current implementation

### Backend routes

The app exposes these routes:
- `POST /api/v1/shorten` - create a short URL.
- `GET /api/v1/shorten` - list all stored short URLs.
- `DELETE /api/v1/shorten/{short_code}` - deactivate a short URL.
- `GET /api/v1/analytics/{short_code}` - return in-memory analytics for one short URL.
- `GET /{short_code}` - redirect to the original URL and record a click event.
- `GET /` - basic service metadata.
- `GET /health` - simple health check.

### Storage model

All application state is stored in Python process memory:
- URL definitions are stored in an in-memory dictionary.
- Analytics events are stored in an in-memory dictionary keyed by short code.
- Rate-limit counters are stored in memory.

As a result:
- restarting the process clears all URLs and analytics;
- multiple app instances would not share data;
- there is no durable persistence layer in the running app.

### Analytics currently tracked

On each redirect, the backend records:
- timestamp;
- IP address (best effort from `X-Forwarded-For` or the client connection);
- referrer;
- user-agent;
- inferred browser;
- inferred operating system;
- inferred device type.

Analytics responses currently include:
- total clicks;
- last clicked timestamp;
- top referrers;
- browser breakdown;
- device breakdown;
- recent click events.

## Run locally

### Requirements

- Python 3.11+
- `pip`

### Install and start

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
The API will start at `http://localhost:8000` by default.

## Quick demo flow

### 1. Create a short URL

```bash
curl -X POST http://localhost:8000/api/v1/shorten \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/articles/1","custom_alias":"example1"}'
```

### 2. List stored URLs

```bash
curl http://localhost:8000/api/v1/shorten
```

### 3. Trigger a redirect and record analytics

```bash
curl -i http://localhost:8000/example1 \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/122.0' \
  -H 'Referer: https://news.ycombinator.com/'
```

### 4. View analytics

```bash
curl http://localhost:8000/api/v1/analytics/example1
```

### 5. Deactivate the short URL

```bash
curl -X DELETE http://localhost:8000/api/v1/shorten/example1
```

## Current scope / Future work

The following items are **not implemented in the running application** and should be treated as future work rather than current features:

- **Authentication and authorization**
  - No registration, login, JWT, sessions, or per-user ownership checks.
- **Frontend dashboard**
  - No React UI is wired into the project build or runtime flow.
- **PostgreSQL persistence**
  - Database helper files exist, but the FastAPI app does not initialize or use PostgreSQL for URLs, users, or analytics.
- **Valkey caching**
  - Valkey helper code exists, but the running app does not initialize or use it for caching, analytics batching, or distributed rate limiting.
- **GeoIP enrichment**
  - Analytics do not currently resolve country or city information.
- **Multi-instance deployment support**
  - The app keeps state in local memory and is therefore not ready for horizontally scaled deployment.
- **Production-grade reliability guarantees**
  - No background jobs, no durable event pipeline, and no shared-state coordination.

## Notes for evaluators

If you are evaluating this submission against a larger system-design document, please use `docs/system.md` as the authoritative description of the **current prototype only**. The older production-style claims have been removed from that document and replaced with implementation-accurate scope notes.
