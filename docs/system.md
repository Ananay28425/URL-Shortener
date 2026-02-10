# URL Shortener - System Design Document

## Table of Contents
1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Design](#component-design)
4. [Data Models](#data-models)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [URL Shortening Algorithm](#url-shortening-algorithm)
8. [Analytics Pipeline](#analytics-pipeline)
9. [Caching Strategy](#caching-strategy)
10. [Database Schema](#database-schema)
11. [Security Considerations](#security-considerations)
12. [Deployment Architecture](#deployment-architecture)

---

## Overview

### Project Purpose
A production-grade URL shortening service that converts long URLs into short, shareable links while providing comprehensive analytics on click patterns, geographic distribution, device usage, and referrer sources.

### Core Requirements

**Functional Requirements:**
- Users must be able to create shortened URLs from long URLs
- Users must be able to view all their shortened URLs in a dashboard
- Anonymous users must be redirected when accessing a short URL
- Users must see detailed analytics for each shortened URL including clicks over time, geographic distribution, device breakdown, browser statistics, and referrer sources
- Users must be able to delete their shortened URLs
- The system must track every click with metadata (timestamp, country, device, browser, referrer)

**Non-Functional Requirements:**
- Redirects must complete in under 100 milliseconds for cached URLs
- The system must support at least 1000 requests per second
- URL generation must avoid collisions through proper algorithm design
- The system must maintain 99.9% uptime
- Analytics data must be accurate and never lost
- The system must scale horizontally as traffic increases

### Tech Stack Rationale

**Backend - FastAPI:**
FastAPI was chosen because it provides automatic API documentation through OpenAPI, built-in data validation using Pydantic, asynchronous request handling for better performance, and type hints that catch errors at development time rather than runtime.

**Database - PostgreSQL:**
PostgreSQL handles relational data efficiently with ACID compliance, supports complex analytics queries with window functions and aggregations, provides excellent indexing capabilities for fast lookups, and scales well with proper configuration.

**Cache - Valkey:**
Valkey serves as our caching layer because it provides sub-millisecond read latency for frequently accessed URLs, supports atomic operations for rate limiting, persists data to disk for durability, and can be easily clustered for high availability. Valkey is a fully open-source fork of Redis maintained by the Linux Foundation, ensuring complete license freedom while maintaining full API compatibility.

**Frontend - React:**
React enables building complex interactive dashboards with reusable components, provides excellent performance through virtual DOM, has a massive ecosystem of charting and UI libraries, and supports TypeScript for type safety.

**Containerization - Docker:**
Docker ensures consistent environments across development and production, simplifies dependency management, enables easy scaling through container orchestration, and provides isolation between services.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                           │
│                     (React Application)                         │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             │ REST API                           │ WebSocket (optional)
             │ (JSON)                             │ (real-time updates)
             │                                    │
┌────────────▼────────────────────────────────────▼───────────────┐
│                       Load Balancer                             │
│                    (NGINX / Cloudflare)                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Distributes requests
             │
┌────────────▼────────────────────────────────────────────────────┐
│                    FastAPI Application                          │
│                   (Multiple Instances)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   URL        │  │  Analytics   │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────┬───────────────────┬──────────────────┬──────────────────┘
      │                   │                  │
      │                   │                  │
┌─────▼─────┐      ┌──────▼──────┐    ┌─────▼──────┐
│   Valkey  │      │ PostgreSQL  │    │  GeoIP DB  │
│  (Cache)  │      │  (Primary)  │    │ (MaxMind)  │
│           │      │             │    │            │
│ - URL     │      │ - Users     │    │ - Country  │
│   Cache   │      │ - URLs      │    │   Lookup   │
│ - Rate    │      │ - Clicks    │    │            │
│   Limits  │      │ - Sessions  │    │            │
└───────────┘      └─────────────┘    └────────────┘
```

### Request Flow Patterns

**Pattern 1: Creating a Short URL**
A user submits a long URL through the React frontend. The request reaches the FastAPI backend with a JWT token for authentication. The backend validates the token, generates a unique short code using Base62 encoding, stores the URL mapping in PostgreSQL, and returns the short URL to the user. This entire process takes approximately 50-100 milliseconds.

**Pattern 2: Accessing a Short URL (Redirect)**
An anonymous user clicks on a short URL. The request hits the load balancer and routes to a FastAPI instance. The backend first checks Valkey cache for the URL mapping. If found (cache hit), the user is redirected immediately in under 10 milliseconds. If not found (cache miss), the backend queries PostgreSQL, caches the result in Valkey for future requests, and redirects the user. Simultaneously, the backend writes click metadata to PostgreSQL asynchronously to avoid blocking the redirect response.

**Pattern 3: Viewing Analytics**
A user navigates to the analytics page for their shortened URL. The frontend requests analytics data from the FastAPI backend. The backend queries the clicks table with time-range filters and grouping clauses to generate statistics. PostgreSQL aggregates data using window functions and returns counts by country, device, browser, and time period. The backend formats this data and returns it as JSON. The React frontend renders this data using Recharts components as interactive visualizations.

---

## Component Design

### Backend Components

#### 1. Authentication Service (`app/routers/auth.py`)

This component handles all user authentication and session management.

**Responsibilities:**
- User registration with email and password
- Password hashing using bcrypt with salt rounds
- Login with JWT token generation
- Token validation and refresh
- Password reset flows (future enhancement)

**Key Functions:**
```python
async def register_user(user_data: UserCreate) -> User:
    """
    Registers a new user in the system.
    
    Process:
    1. Validate email format and uniqueness
    2. Check password strength (min 8 chars, complexity)
    3. Hash password using bcrypt with cost factor 12
    4. Insert user record into database
    5. Return user object (without password hash)
    """
    
async def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Authenticates user credentials.
    
    Process:
    1. Query user by email
    2. Verify password hash using bcrypt
    3. Return user object if valid, None if invalid
    """
    
async def create_access_token(user_id: UUID) -> str:
    """
    Creates a JWT access token.
    
    Process:
    1. Create payload with user_id and expiration (7 days)
    2. Sign with SECRET_KEY using HS256 algorithm
    3. Return encoded token string
    """
```

**Data Structures:**
```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Must be 8+ characters
    
class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime
    
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

#### 2. URL Service (`app/routers/urls.py`)

This component manages URL shortening, retrieval, and deletion.

**Responsibilities:**
- Generate unique short codes
- Store URL mappings
- Handle collision detection
- Manage URL lifecycle (create, read, delete)
- Enforce user ownership of URLs

**Key Functions:**
```python
async def generate_short_code(length: int = 6) -> str:
    """
    Generates a unique short code using Base62 encoding.
    
    Base62 uses: [a-z, A-Z, 0-9] = 62 characters
    With 6 characters: 62^6 = 56.8 billion possible codes
    
    Process:
    1. Generate random bytes using secrets module (cryptographically secure)
    2. Convert to Base62 string
    3. Check database for collision
    4. If collision (extremely rare), regenerate
    5. Return unique code
    """
    
async def create_short_url(original_url: str, user_id: UUID) -> ShortURL:
    """
    Creates a new short URL mapping.
    
    Process:
    1. Validate original URL format (must be http/https)
    2. Generate unique short code
    3. Insert into urls table with user_id
    4. Return ShortURL object with full short link
    """
    
async def get_original_url(short_code: str) -> Optional[str]:
    """
    Retrieves original URL from short code.
    
    Process:
    1. Check Valkey cache first (O(1) lookup)
    2. If cache miss, query PostgreSQL
    3. If found, cache in Valkey with 24h TTL
    4. Return original URL or None
    """
```

**Data Structures:**
```python
class URLCreate(BaseModel):
    original_url: HttpUrl  # Pydantic validates URL format
    custom_alias: Optional[str] = None  # For future enhancement
    expires_at: Optional[datetime] = None  # For future enhancement
    
class ShortURL(BaseModel):
    id: UUID
    short_code: str
    original_url: str
    created_at: datetime
    clicks: int = 0
    is_active: bool = True
```

#### 3. Analytics Service (`app/routers/analytics.py`)

This component processes and aggregates click data for visualization.

**Responsibilities:**
- Track every click with metadata
- Aggregate clicks by time, geography, device, browser, referrer
- Calculate statistics and percentages
- Generate time-series data
- Perform geolocation lookups

**Key Functions:**
```python
async def track_click(short_code: str, request: Request) -> None:
    """
    Records a click event with full metadata.
    
    Process:
    1. Extract IP address from request headers (handle proxies)
    2. Perform GeoIP lookup to get country code
    3. Parse User-Agent to get device type and browser
    4. Extract referrer from headers (if present)
    5. Insert click record into database asynchronously
    
    This runs async to not block the redirect response.
    """
    
async def get_analytics(short_code: str, date_range: DateRange) -> AnalyticsData:
    """
    Retrieves comprehensive analytics for a URL.
    
    Process:
    1. Query clicks table with date range filter
    2. Aggregate by day for time series data
    3. Group by country and count for geographic distribution
    4. Group by device_type and browser for device/browser stats
    5. Group by referrer for traffic sources
    6. Calculate percentages and totals
    7. Return structured analytics object
    """
```

**Analytics Queries (PostgreSQL):**
```sql
-- Time series data (clicks per day)
SELECT 
    DATE(clicked_at) as date,
    COUNT(*) as clicks
FROM clicks
WHERE url_id = $1 
  AND clicked_at >= $2 
  AND clicked_at <= $3
GROUP BY DATE(clicked_at)
ORDER BY date ASC;

-- Geographic distribution
SELECT 
    country,
    COUNT(*) as clicks,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM clicks
WHERE url_id = $1
GROUP BY country
ORDER BY clicks DESC
LIMIT 10;

-- Device breakdown
SELECT 
    device_type,
    COUNT(*) as clicks,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM clicks
WHERE url_id = $1
GROUP BY device_type;
```

**Data Structures:**
```python
class ClickEvent(BaseModel):
    id: UUID
    url_id: UUID
    clicked_at: datetime
    country: str  # ISO 3166-1 alpha-2 code
    device_type: DeviceType  # Enum: mobile, desktop, tablet
    browser: str
    referrer: Optional[str]
    
class AnalyticsData(BaseModel):
    total_clicks: int
    clicks_by_day: List[DailyClicks]
    clicks_by_country: List[CountryClicks]
    clicks_by_device: List[DeviceClicks]
    clicks_by_browser: List[BrowserClicks]
    clicks_by_referrer: List[ReferrerClicks]
```

### Frontend Components

#### 1. Authentication Pages

**LoginPage (`/login`):**
Renders a login form with email and password fields. When submitted, it sends credentials to the backend API. On success, it stores the JWT token in localStorage and redirects to the dashboard.

**SignupPage (`/signup`):**
Renders a registration form with email, password, and confirm password fields. Validates password strength on the frontend before submission. On successful registration, it automatically logs the user in.

#### 2. Dashboard (`/dashboard`)

**Layout:**
The dashboard consists of a header with navigation, three stat cards showing aggregate metrics, a data table of all user URLs, and a create button for new URLs.

**StatCards Component:**
Displays three key metrics fetched from the backend: total URLs created, total clicks across all URLs, and currently active URLs. Each card shows the current value as a large number.

**URLsTable Component:**
Renders a paginated table of all URLs owned by the user. Each row displays the short code, original URL (truncated with tooltip), click count, creation date, and action buttons for viewing analytics and deleting.

**Data Fetching:**
Uses TanStack Query to fetch dashboard data with automatic refetching every 30 seconds. This keeps the click counts updated without manual refresh.

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => api.get('/api/urls'),
  refetchInterval: 30000,  // Refetch every 30 seconds
});
```

#### 3. Analytics Page (`/analytics/:shortCode`)

**Layout:**
The analytics page displays comprehensive visualizations of click data for a specific shortened URL. It includes a header showing the original URL and total clicks, a date range selector, and multiple chart components.

**TimeSeriesChart Component:**
Renders a line chart showing clicks over the selected time period. Uses Recharts LineChart with smooth curves and gradient fill. The X-axis shows dates, Y-axis shows click counts, and tooltips display exact values on hover.

**GeographicDistribution Component:**
Displays a table of top countries with flag emojis, country names, click counts, and percentage bars. Future enhancement could include an interactive world map using react-simple-maps.

**DeviceBreakdown Component:**
Renders a donut chart showing the distribution of clicks by device type (mobile, desktop, tablet). Uses percentage labels and device icons for visual clarity.

**BrowserStats Component:**
Displays a horizontal bar chart of browser usage with browser logos. Shows both absolute click counts and percentages.

**ReferrerSources Component:**
Renders a bar chart of traffic sources showing where clicks originated (direct, search engines, social media, etc.).

**Data Fetching:**
```javascript
const { data: analytics } = useQuery({
  queryKey: ['analytics', shortCode, dateRange],
  queryFn: () => api.get(`/api/urls/${shortCode}/stats`, {
    params: { start_date, end_date }
  }),
});
```

---

## Data Models

### Database Schema (PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Design Decisions:**
- UUID primary key provides globally unique identifiers that don't leak user count
- Email is indexed for fast login queries
- Password is hashed with bcrypt, never stored in plaintext
- Timestamps track account creation and updates

#### URLs Table
```sql
CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_created_at ON urls(created_at DESC);
```

**Design Decisions:**
- short_code is uniquely indexed for O(1) lookups during redirects
- user_id foreign key ensures cascade deletion when user is deleted
- original_url is TEXT to support very long URLs (up to 1GB in PostgreSQL)
- expires_at allows future implementation of time-limited links
- is_active enables soft deletion without losing analytics data

#### Clicks Table
```sql
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(2),  -- ISO 3166-1 alpha-2
    city VARCHAR(100),
    device_type VARCHAR(20),  -- mobile, desktop, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    referrer TEXT,
    ip_hash VARCHAR(64)  -- Hashed for privacy, not stored raw
);

CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX idx_clicks_country ON clicks(country);
CREATE INDEX idx_clicks_composite ON clicks(url_id, clicked_at DESC);
```

**Design Decisions:**
- Composite index on (url_id, clicked_at) optimizes common analytics queries
- Country indexed separately for geographic distribution queries
- IP address is hashed (SHA-256) for privacy, not stored in plaintext
- clicked_at indexed in descending order for "recent clicks" queries
- Partitioning by month recommended for tables exceeding 10M rows (future scaling)

### SQLAlchemy Models

```python
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    urls = relationship("URL", back_populates="owner", cascade="all, delete-orphan")

class URL(Base):
    __tablename__ = "urls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_url = Column(Text, nullable=False)
    short_code = Column(String(10), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    owner = relationship("User", back_populates="urls")
    clicks = relationship("Click", back_populates="url", cascade="all, delete-orphan")

class Click(Base):
    __tablename__ = "clicks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url_id = Column(UUID(as_uuid=True), ForeignKey("urls.id", ondelete="CASCADE"), nullable=False)
    clicked_at = Column(DateTime, default=datetime.utcnow, index=True)
    country = Column(String(2), index=True)
    city = Column(String(100))
    device_type = Column(String(20))
    browser = Column(String(50))
    os = Column(String(50))
    referrer = Column(Text, nullable=True)
    ip_hash = Column(String(64))
    
    # Relationships
    url = relationship("URL", back_populates="clicks")
```

---

## API Design

### REST API Endpoints

All endpoints follow RESTful conventions with proper HTTP methods and status codes.

#### Authentication Endpoints

```
POST /api/auth/register
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}

Errors:
400 Bad Request - Invalid email format or weak password
409 Conflict - Email already exists
```

```
POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800  // 7 days in seconds
}

Errors:
401 Unauthorized - Invalid credentials
```

#### URL Management Endpoints

```
POST /api/urls
Headers:
  Authorization: Bearer {token}

Request:
{
  "original_url": "https://www.example.com/very/long/url/with/many/parameters"
}

Response: 201 Created
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "short_code": "aB3xY9",
  "original_url": "https://www.example.com/very/long/url/with/many/parameters",
  "short_url": "https://sho.rt/aB3xY9",
  "created_at": "2024-01-15T10:30:00Z",
  "clicks": 0,
  "is_active": true
}

Errors:
400 Bad Request - Invalid URL format
401 Unauthorized - Missing or invalid token
429 Too Many Requests - Rate limit exceeded
```

```
GET /api/urls
Headers:
  Authorization: Bearer {token}

Query Parameters:
  page: int = 1
  limit: int = 10
  search: string (optional)

Response: 200 OK
{
  "urls": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "short_code": "aB3xY9",
      "original_url": "https://example.com/long-url",
      "short_url": "https://sho.rt/aB3xY9",
      "created_at": "2024-01-15T10:30:00Z",
      "clicks": 1234,
      "is_active": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

```
GET /api/urls/{short_code}/stats
Headers:
  Authorization: Bearer {token}

Query Parameters:
  start_date: date (default: 30 days ago)
  end_date: date (default: today)

Response: 200 OK
{
  "total_clicks": 1234,
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "clicks_by_day": [
    { "date": "2024-01-01", "clicks": 45 },
    { "date": "2024-01-02", "clicks": 52 }
  ],
  "clicks_by_country": [
    { "country": "US", "clicks": 556, "percentage": 45.05 },
    { "country": "IN", "clicks": 370, "percentage": 29.98 }
  ],
  "clicks_by_device": [
    { "device": "mobile", "clicks": 740, "percentage": 59.97 },
    { "device": "desktop", "clicks": 370, "percentage": 29.98 },
    { "device": "tablet", "clicks": 124, "percentage": 10.05 }
  ],
  "clicks_by_browser": [
    { "browser": "Chrome", "clicks": 679, "percentage": 55.02 },
    { "browser": "Safari", "clicks": 309, "percentage": 25.04 }
  ],
  "clicks_by_referrer": [
    { "referrer": "direct", "clicks": 494, "percentage": 40.03 },
    { "referrer": "google.com", "clicks": 308, "percentage": 24.96 }
  ]
}

Errors:
401 Unauthorized - Not the owner of this URL
404 Not Found - Short code doesn't exist
```

```
DELETE /api/urls/{short_code}
Headers:
  Authorization: Bearer {token}

Response: 204 No Content

Errors:
401 Unauthorized - Not the owner of this URL
404 Not Found - Short code doesn't exist
```

#### Redirect Endpoint

```
GET /{short_code}

Response: 302 Found
Headers:
  Location: {original_url}

This endpoint triggers asynchronous click tracking but returns immediately
without waiting for the tracking to complete.

Errors:
404 Not Found - Short code doesn't exist or URL is inactive
410 Gone - URL has expired
```

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",  // user_id
    "exp": 1705920000,  // Expiration timestamp
    "iat": 1705315200   // Issued at timestamp
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), SECRET_KEY)"
}
```

### Authentication Flow

When a user logs in, the backend validates their credentials and generates a JWT token signed with a secret key. This token is returned to the frontend, which stores it in localStorage. For every subsequent request to protected endpoints, the frontend includes this token in the Authorization header as a Bearer token. The backend verifies the token signature, checks the expiration, and extracts the user ID to authorize the request.

### Password Security

Passwords are hashed using bcrypt with a cost factor of 12, which means the hash algorithm runs 2^12 iterations. This makes brute-force attacks computationally expensive. Each password hash includes a unique salt generated by bcrypt, preventing rainbow table attacks. The original password is never stored or logged anywhere in the system.

### Rate Limiting

To prevent abuse, the system implements rate limiting using Valkey. For URL creation, each user is limited to 10 new URLs per hour. This is tracked using a Valkey key with the pattern `ratelimit:create_url:{user_id}` that increments with each request and expires after one hour. For redirect endpoints, IP-based rate limiting prevents automated scraping, allowing 100 requests per minute per IP address.

---

## URL Shortening Algorithm

### Base62 Encoding

The system uses Base62 encoding to generate short codes. Base62 uses 62 characters: lowercase letters (a-z), uppercase letters (A-Z), and digits (0-9). This character set is chosen because it is URL-safe and case-sensitive, maximizing the number of possible codes.

**Calculation:**
With 6 characters, we have 62^6 = 56,800,235,584 possible codes (over 56 billion). This is sufficient for a production system. If we need more codes in the future, we can increase to 7 characters, giving us 62^7 = 3.5 trillion codes.

### Generation Process

```python
import secrets
import string

BASE62_ALPHABET = string.ascii_letters + string.digits  # a-zA-Z0-9

def generate_short_code(length: int = 6) -> str:
    """
    Generates a cryptographically secure random short code.
    
    Using secrets module ensures randomness suitable for security-sensitive
    applications, preventing predictable URL generation.
    """
    return ''.join(secrets.choice(BASE62_ALPHABET) for _ in range(length))

async def create_unique_short_code(db: Session) -> str:
    """
    Generates a unique short code with collision checking.
    
    The probability of collision with 6-character codes is extremely low
    (< 0.001% even with 1 million URLs), but we check anyway for safety.
    """
    max_attempts = 5
    
    for attempt in range(max_attempts):
        code = generate_short_code()
        
        # Check if code already exists
        exists = await db.execute(
            select(URL).where(URL.short_code == code)
        )
        
        if not exists.scalar_one_or_none():
            return code
    
    # If collision after 5 attempts (virtually impossible), use 7 chars
    return generate_short_code(length=7)
```

### Why Not Sequential IDs?

Sequential IDs (1, 2, 3, ...) are problematic because they leak information about the number of URLs in the system and allow enumeration attacks where someone could systematically try all short codes. Random codes prevent this vulnerability.

### Why Not Hash-Based?

Hashing the original URL (e.g., MD5 or SHA-256) and taking the first 6 characters would ensure the same URL always gets the same short code. However, this has several problems: hash collisions become more likely as the database grows, users cannot create multiple short links for the same URL, and attackers could potentially reverse-engineer patterns. Random generation with collision checking is more robust.

---

## Analytics Pipeline

### Click Tracking Workflow

When a user accesses a short URL, the following process occurs in under 100 milliseconds:

**Step 1: URL Lookup (10-50ms)**
The backend receives the request and immediately queries Valkey cache using the key pattern `url:{short_code}`. If found, it retrieves the original URL. If not found, it queries PostgreSQL, retrieves the URL, and caches it in Valkey with a 24-hour TTL.

**Step 2: Redirect Response (immediate)**
The backend returns a 302 redirect response with the Location header set to the original URL. This happens immediately without waiting for analytics tracking to complete.

**Step 3: Asynchronous Click Tracking (50-100ms, non-blocking)**
After sending the redirect response, the backend asynchronously processes click metadata:

```python
@app.get("/{short_code}")
async def redirect_to_url(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Step 1: Get URL (blocking)
    url = await get_url_from_cache_or_db(short_code, db)
    
    if not url:
        raise HTTPException(status_code=404)
    
    # Step 2: Add tracking to background (non-blocking)
    background_tasks.add_task(
        track_click,
        url_id=url.id,
        request=request,
        db=db
    )
    
    # Step 3: Redirect immediately
    return RedirectResponse(url=url.original_url, status_code=302)


async def track_click(url_id: UUID, request: Request, db: Session):
    """
    Tracks click with full metadata extraction.
    
    This runs after the redirect response is sent, so it doesn't
    slow down the user experience.
    """
    # Extract IP address (handle X-Forwarded-For for proxies)
    ip_address = request.headers.get("X-Forwarded-For", request.client.host)
    if "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()
    
    # Hash IP for privacy
    import hashlib
    ip_hash = hashlib.sha256(ip_address.encode()).hexdigest()
    
    # GeoIP lookup
    country = await get_country_from_ip(ip_address)
    
    # Parse User-Agent
    user_agent = request.headers.get("User-Agent", "")
    device_type, browser, os = parse_user_agent(user_agent)
    
    # Extract referrer
    referrer = request.headers.get("Referer")
    
    # Insert click record
    click = Click(
        url_id=url_id,
        country=country,
        device_type=device_type,
        browser=browser,
        os=os,
        referrer=referrer,
        ip_hash=ip_hash
    )
    
    db.add(click)
    await db.commit()
```

### GeoIP Lookup

The system uses MaxMind's GeoLite2 database (free) to map IP addresses to countries. This database is loaded into memory at startup for fast lookups (< 1ms per lookup).

```python
import geoip2.database

# Load database at startup
reader = geoip2.database.Reader('/path/to/GeoLite2-Country.mmdb')

def get_country_from_ip(ip_address: str) -> str:
    """
    Returns ISO 3166-1 alpha-2 country code.
    
    Examples: US, IN, GB, CA, AU
    """
    try:
        response = reader.country(ip_address)
        return response.country.iso_code
    except:
        return "XX"  # Unknown country
```

### User-Agent Parsing

The system uses the `user-agents` library to parse User-Agent strings and extract device type, browser, and operating system.

```python
from user_agents import parse

def parse_user_agent(ua_string: str) -> tuple[str, str, str]:
    """
    Parses User-Agent string into device, browser, and OS.
    
    Returns: (device_type, browser, os)
    """
    ua = parse(ua_string)
    
    # Determine device type
    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    else:
        device_type = "desktop"
    
    # Extract browser
    browser = ua.browser.family  # "Chrome", "Safari", "Firefox", etc.
    
    # Extract OS
    os = ua.os.family  # "iOS", "Android", "Windows", etc.
    
    return (device_type, browser, os)
```

### Analytics Aggregation

When a user requests analytics, the system runs optimized SQL queries that group and aggregate click data. These queries use PostgreSQL's window functions for efficient percentage calculations.

```sql
-- This query calculates country distribution with percentages
SELECT 
    country,
    COUNT(*) as clicks,
    ROUND(
        100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 
        2
    ) as percentage
FROM clicks
WHERE url_id = $1 
  AND clicked_at >= $2 
  AND clicked_at <= $3
GROUP BY country
ORDER BY clicks DESC
LIMIT 10;
```

The `SUM(COUNT(*)) OVER()` is a window function that calculates the total clicks across all countries, allowing us to compute percentages in a single query rather than making two separate queries.

---

## Caching Strategy

### Two-Tier Caching Architecture

The system implements a two-tier caching strategy: Valkey for distributed caching and in-memory caching for extremely hot data.

**Tier 1: Valkey (Distributed Cache)**
- Caches URL mappings for all short codes
- Cache key pattern: `url:{short_code}`
- TTL: 24 hours
- Invalidation: On URL deletion or deactivation
- Size: Approximately 1KB per entry

**Tier 2: Application Memory (Optional)**
- Caches top 1000 most-accessed URLs
- Uses LRU eviction policy
- TTL: 1 hour
- Bypassed in multi-instance deployments unless using sticky sessions

### Cache Warming

On application startup, the system pre-populates Valkey cache with the most frequently accessed URLs from the past 7 days. This prevents cache misses for popular links during the initial period after deployment.

```python
async def warm_cache_on_startup(db: Session, redis: Redis):
    """
    Pre-loads hot URLs into cache.
    
    Queries the top 1000 most-clicked URLs from the past 7 days
    and loads them into Valkey.
    """
    hot_urls = await db.execute(
        select(URL)
        .join(Click)
        .where(Click.clicked_at >= datetime.now() - timedelta(days=7))
        .group_by(URL.id)
        .order_by(func.count(Click.id).desc())
        .limit(1000)
    )
    
    for url in hot_urls.scalars():
        await redis.set(
            f"url:{url.short_code}",
            url.original_url,
            ex=86400  # 24 hours
        )
```

### Cache Invalidation

Cache invalidation follows the principle "when in doubt, invalidate." URLs are removed from cache when:
- The URL is deleted by the user
- The URL is deactivated
- The URL expires (if expiration is set)

```python
async def delete_url(short_code: str, db: Session, redis: Redis):
    """
    Deletes URL and invalidates cache.
    """
    # Delete from database
    await db.execute(
        delete(URL).where(URL.short_code == short_code)
    )
    await db.commit()
    
    # Invalidate cache
    await redis.delete(f"url:{short_code}")
```

### Cache Miss Handling

When a cache miss occurs (URL not in Valkey), the system queries PostgreSQL, retrieves the URL, and immediately caches it before returning the response. This ensures subsequent requests hit the cache.

**Cache Hit Ratio Monitoring:**
The system tracks cache hit ratio using Valkey metrics:
```
hits = redis.info()['keyspace_hits']
misses = redis.info()['keyspace_misses']
hit_ratio = hits / (hits + misses)
```

Target hit ratio: > 95% for a healthy cache.

---

## Security Considerations

### Input Validation

All user inputs are validated using Pydantic models before processing. This prevents injection attacks and ensures data integrity.

```python
from pydantic import BaseModel, HttpUrl, EmailStr, validator

class URLCreate(BaseModel):
    original_url: HttpUrl  # Pydantic validates URL format
    
    @validator('original_url')
    def validate_url_scheme(cls, v):
        """Ensure only HTTP/HTTPS URLs are allowed."""
        if v.scheme not in ['http', 'https']:
            raise ValueError('Only HTTP/HTTPS URLs are allowed')
        return v
```

### SQL Injection Prevention

The system uses SQLAlchemy ORM with parameterized queries, which automatically escapes user input and prevents SQL injection attacks. Direct string concatenation for SQL queries is never used.

**Vulnerable (DO NOT USE):**
```python
# NEVER DO THIS
query = f"SELECT * FROM urls WHERE short_code = '{short_code}'"
```

**Safe (ALWAYS DO THIS):**
```python
# SQLAlchemy automatically parameterizes queries
url = await db.execute(
    select(URL).where(URL.short_code == short_code)
)
```

### XSS Prevention

The React frontend automatically escapes all user-generated content, preventing cross-site scripting attacks. URLs are never rendered as raw HTML.

### CSRF Protection

Since the API uses JWT tokens in headers (not cookies), it is not vulnerable to CSRF attacks. However, the frontend implements additional protection by validating the token origin.

### Rate Limiting

To prevent abuse and DDoS attacks, the system implements multiple rate limiting layers:

**Layer 1: URL Creation Rate Limiting**
- 10 URLs per hour per authenticated user
- Implemented using Valkey with sliding window

```python
async def check_rate_limit(user_id: UUID, redis: Redis) -> bool:
    """
    Checks if user has exceeded rate limit.
    
    Uses sliding window counter in Valkey.
    """
    key = f"ratelimit:create_url:{user_id}"
    
    # Increment counter
    count = await redis.incr(key)
    
    # Set expiration on first request
    if count == 1:
        await redis.expire(key, 3600)  # 1 hour
    
    return count <= 10  # Max 10 URLs per hour
```

**Layer 2: Redirect Rate Limiting**
- 100 redirects per minute per IP address
- Prevents automated scraping

**Layer 3: API Rate Limiting**
- 1000 requests per hour per user
- Applies to all authenticated endpoints

### Data Privacy

The system implements privacy-by-design principles:
- IP addresses are hashed, never stored in plaintext
- No personally identifiable information (PII) is collected without consent
- Users can delete their data at any time (GDPR compliance)
- Analytics data is anonymized and aggregated

---

## Deployment Architecture

### Docker Compose Setup

The system runs as multiple containers orchestrated by Docker Compose:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: urlshortener
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-EXEC", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  valkey:
    image: valkey/valkey:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - valkey_data:/data
    command: valkey-server --appendonly yes
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/urlshortener
      VALKEY_URL: valkey://valkey:6379
      SECRET_KEY: ${JWT_SECRET_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      REACT_APP_API_URL: http://localhost:8000

volumes:
  postgres_data:
  valkey_data:
```

### Production Deployment Recommendations

**Platform Choice:**
Deploy to Railway, Render, or AWS ECS. These platforms provide managed PostgreSQL and Valkey instances, automatic SSL certificates, and easy scaling.

**Environment Variables:**
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
VALKEY_URL=valkey://host:6379
SECRET_KEY=your-256-bit-secret-key
ENVIRONMENT=production

# Frontend
REACT_APP_API_URL=https://api.yourshortener.com
```

**Health Checks:**
Implement health check endpoints for monitoring:

```python
@app.get("/health")
async def health_check(db: Session = Depends(get_db), redis: Redis = Depends(get_redis)):
    """
    Health check endpoint for load balancer.
    
    Returns 200 if all services are healthy, 503 otherwise.
    """
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        
        # Check Valkey connection
        await redis.ping()
        
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Service unhealthy")
```

### CI/CD Pipeline

Implement automated testing and deployment using GitHub Actions:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest --cov=app tests/
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy commands here
```

---

## Conclusion

This system design provides a comprehensive blueprint for building a production-grade URL shortener with analytics. The architecture is scalable, maintainable, and secure, utilizing industry-standard technologies and best practices. By following this design, the OpenCode CLI or any developer can implement a robust URL shortening service that handles millions of requests efficiently while providing valuable insights through detailed analytics.
