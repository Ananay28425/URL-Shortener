# URL Shortener - Current Prototype Design

## Overview

This document describes the **current implementation only**.

The repository presently contains a **minimal backend prototype** built with FastAPI. It supports creating short URLs, listing them, redirecting through short codes, deactivating codes, and viewing lightweight analytics gathered from redirect requests.

This is **not** the larger production-style system that earlier versions of this document described.

## Prototype scope

### Implemented capabilities

The running app currently implements:
- short URL creation;
- short URL listing;
- short URL deactivation;
- redirect handling;
- click counting;
- lightweight analytics aggregation;
- anonymous in-memory rate limiting on URL creation;
- CORS configuration and a simple health check.

### Runtime characteristics

The app is process-local and stateful:
- URL records are stored in memory.
- Click analytics are stored in memory.
- Rate-limit state is stored in memory.
- Restarting the app clears all data.
- Running multiple instances would create inconsistent state across instances.

## Current architecture

```text
Client
  |
  v
FastAPI application
  |- shorten API
  |- analytics API
  |- redirect API
  |- in-memory URL service
  |- in-memory analytics service
  |- in-memory rate limiter
```

## Application components

### 1. FastAPI app wiring

`url_shortener/main.py` creates the FastAPI app and wires together:
- `URLService` for in-memory URL storage;
- `AnalyticsService` for in-memory click collection and aggregation;
- `RedirectService` for redirect resolution plus analytics tracking;
- `InMemoryRateLimiter` for basic request limiting on create operations.

The app exposes:
- `/` for a basic metadata response;
- `/health` for a simple health check;
- `/api/v1/shorten` routes;
- `/api/v1/analytics/{short_code}`;
- `/{short_code}` redirect handling.

### 2. URL service

`URLService` is the core storage layer for the prototype.

Current behavior:
- stores URLs in a Python dictionary;
- generates a unique short code when no custom alias is supplied;
- supports optional expiration timestamps;
- marks records inactive on delete;
- increments click counters during redirects;
- rejects duplicate custom aliases.

Because it uses process memory only, it is suitable for local development and evaluation demos, not durable production use.

### 3. Analytics service

`AnalyticsService` collects click events in memory.

Current behavior:
- records timestamp, IP address, referrer, user-agent, browser, OS, and device type;
- keeps events grouped by short code;
- returns aggregate analytics derived from stored events;
- removes stored analytics when a short URL is deleted.

The browser, OS, and device classifications are lightweight heuristics based on user-agent string matching.

### 4. Redirect service

`RedirectService` performs two actions for a valid active short code:
1. increments the URL's click count;
2. records a click event via `AnalyticsService`;
3. returns an HTTP 307 redirect to the original URL.

### 5. API surface

#### `POST /api/v1/shorten`
Creates a short URL.

Accepted fields:
- `url` - required HTTP/HTTPS URL;
- `custom_alias` - optional custom short code;
- `expires_in_days` - optional expiration interval.

#### `GET /api/v1/shorten`
Lists all stored URLs in reverse creation order.

#### `DELETE /api/v1/shorten/{short_code}`
Marks the short URL inactive and clears its analytics history.

#### `GET /api/v1/analytics/{short_code}`
Returns current analytics for an active short URL.

#### `GET /{short_code}`
Redirects to the original URL when the short code exists and is active.

## Data handled by the prototype

### URL record fields
Each in-memory URL record currently stores:
- `short_code`;
- `original_url`;
- `created_at`;
- `expires_at`;
- `click_count`;
- `is_active`;
- `custom_alias`.

### Analytics event fields
Each click event currently stores:
- `timestamp`;
- `ip_address`;
- `referer`;
- `user_agent`;
- `country` (currently unused / not enriched);
- `city` (currently unused / not enriched);
- `browser`;
- `os`;
- `device_type`.

### Analytics response fields
The current analytics response includes:
- `short_code`;
- `original_url`;
- `short_url`;
- `total_clicks`;
- `last_clicked_at`;
- `top_referrers`;
- `browser_breakdown`;
- `device_breakdown`;
- `recent_clicks`.

## Explicitly unimplemented in the current app

The following areas were described in earlier, more ambitious design notes but are **not implemented in the running application**.

### Authentication and authorization
**Status:** not implemented.

Not present today:
- user registration;
- login;
- JWT or session issuance;
- password hashing flows in the running app;
- route protection;
- per-user URL ownership.

### React dashboard
**Status:** not implemented.

There is no functional frontend dashboard wired into the application runtime. The repository contains a `frontend/` directory, but there is no implemented evaluator-facing dashboard flow in the current submission.

### PostgreSQL persistence
**Status:** not implemented in app runtime.

The repository includes draft database-related modules and models, but `url_shortener/main.py` does not initialize PostgreSQL or route reads/writes through a database-backed repository.

### Valkey caching
**Status:** not implemented in app runtime.

The repository includes Valkey helper code, but the running app does not initialize Valkey, cache URL lookups, perform distributed rate limiting, or batch analytics through Valkey.

### GeoIP enrichment
**Status:** not implemented.

Analytics do not currently resolve country or city from IP addresses.

### Multi-instance deployment
**Status:** not implemented / not supported by current state model.

Because URLs, analytics, and rate-limiter data all live in memory inside one process, the current app is not suitable for horizontally scaled multi-instance deployment.

## Current scope / Future work

If this project were extended beyond the prototype, the next major pieces of work would be:
- add persistent storage for URLs and analytics;
- replace in-memory rate limiting with a shared backend;
- introduce authentication and per-user URL ownership;
- build and wire a frontend dashboard;
- add cache-backed redirect lookups;
- enrich analytics with GeoIP data;
- make the app stateless so multiple instances can share data safely;
- add production deployment, observability, and background processing.

## Evaluation guidance

This document should be read as an implementation-accurate prototype description. It should not be interpreted as a claim that the repository already includes a full production stack.
