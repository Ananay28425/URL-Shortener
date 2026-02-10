# URL Shortener - Scaling Guide

## Table of Contents
1. [Scaling Overview](#scaling-overview)
2. [Performance Bottlenecks](#performance-bottlenecks)
3. [Scaling Strategies](#scaling-strategies)
4. [Database Scaling](#database-scaling)
5. [Caching at Scale](#caching-at-scale)
6. [Load Balancing](#load-balancing)
7. [CDN Integration](#cdn-integration)
8. [Monitoring & Observability](#monitoring--observability)
9. [Scaling Milestones](#scaling-milestones)
10. [Cost Optimization](#cost-optimization)

---

## Scaling Overview

### What is Scalability?

Scalability is the system's ability to handle increased load without degrading performance or requiring a complete architectural redesign. For a URL shortener, load comes from two primary sources: redirect requests (read-heavy) and URL creation requests (write-moderate). A scalable system maintains sub-100ms redirect latency and sub-500ms URL creation time even as traffic grows from 100 requests per second to 100,000 requests per second.

### Scaling Dimensions

**Vertical Scaling (Scale Up):**
Increasing the resources of existing servers by adding more CPU cores, RAM, or faster storage. This is simple to implement but has hard limits. You cannot infinitely upgrade a single server, and there is a point of diminishing returns where doubling the cost yields less than double the performance.

**Horizontal Scaling (Scale Out):**
Adding more servers to distribute load across multiple machines. This approach has virtually unlimited potential but requires the application to be stateless and properly architected. Most modern web applications, including our URL shortener, should be designed for horizontal scaling from day one.

### Read vs Write Patterns

URL shorteners are heavily read-biased. For every URL creation (write), there are typically 100-1000 redirects (reads). This 1:100 or 1:1000 read-write ratio means that optimizing read performance through aggressive caching is more impactful than optimizing write performance. However, analytics writes (click tracking) happen on every redirect, so the actual write load is higher than URL creation alone.

**Typical Traffic Pattern:**
```
URL Creation:     100 requests/sec   (writes to urls table)
Redirects:     10,000 requests/sec   (reads from cache/database)
Click Tracking: 10,000 requests/sec   (writes to clicks table)
Analytics:         10 requests/sec   (read-heavy aggregation queries)
```

This means our scaling strategy must prioritize read optimization while ensuring write paths can handle sustained high throughput.

---

## Performance Bottlenecks

### Identifying Bottlenecks

Before scaling, you must identify where the system is constrained. Common bottlenecks in URL shorteners include database query latency, cache hit ratio, network bandwidth, CPU utilization during analytics aggregation, and memory exhaustion from in-memory caching.

### Database Query Latency

**Symptom:** Redirect requests taking 200-500ms instead of sub-50ms.

**Diagnosis:**
```sql
-- Check slow queries in PostgreSQL
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Root Causes:**
- Missing indexes on frequently queried columns (short_code, url_id)
- Table scans instead of index scans
- Inefficient joins in analytics queries
- Lock contention on write-heavy tables

**Solutions:**
- Add indexes on all foreign keys and frequently filtered columns
- Use EXPLAIN ANALYZE to understand query execution plans
- Implement read replicas for analytics queries
- Use connection pooling to reduce connection overhead

### Cache Miss Ratio

**Symptom:** High database load even with Valkey cache in place.

**Diagnosis:**
```python
# Monitor Valkey cache hit ratio
info = redis.info('stats')
hits = info['keyspace_hits']
misses = info['keyspace_misses']
hit_ratio = hits / (hits + misses) if (hits + misses) > 0 else 0

print(f"Cache hit ratio: {hit_ratio:.2%}")
```

**Target:** Greater than 95% hit ratio for URL lookups.

**Root Causes:**
- Cache TTL too short, causing premature eviction
- Cache size too small, leading to LRU evictions
- Cold cache after deployment or restart
- Traffic patterns with long-tail distribution (many rarely-accessed URLs)

**Solutions:**
- Increase cache TTL for URL mappings to 24-48 hours
- Scale Valkey memory vertically or add Valkey cluster nodes
- Implement cache warming on startup for hot URLs
- Use tiered caching with in-memory cache for hottest URLs

### CPU Bottlenecks

**Symptom:** High CPU usage during analytics aggregation or peak traffic.

**Diagnosis:**
```bash
# Monitor CPU usage
top -p $(pgrep -f uvicorn)

# Profile Python code
python -m cProfile -o output.prof app/main.py
```

**Root Causes:**
- Inefficient analytics aggregation logic in Python
- Lack of database-level aggregation (doing aggregation in application)
- Synchronous blocking operations on the main thread
- JSON serialization overhead for large responses

**Solutions:**
- Push aggregation to PostgreSQL using window functions and GROUP BY
- Use asynchronous operations for I/O-bound tasks
- Implement pagination to reduce response size
- Add horizontal scaling with multiple backend instances

### Memory Exhaustion

**Symptom:** Application crashes with OOM (out of memory) errors or degraded performance due to swapping.

**Diagnosis:**
```bash
# Monitor memory usage
ps aux | grep uvicorn
free -h
```

**Root Causes:**
- In-memory caching without size limits
- Memory leaks in long-running processes
- Large result sets loaded entirely into memory
- Inefficient data structures

**Solutions:**
- Implement LRU cache with maximum size limit
- Use streaming responses for large datasets
- Monitor for memory leaks and restart workers periodically
- Use generators and lazy evaluation for large queries

---

## Scaling Strategies

### Horizontal Scaling (Recommended)

Horizontal scaling involves running multiple instances of the FastAPI application behind a load balancer. Each instance is stateless, meaning it does not store any session data locally. All state is externalized to PostgreSQL and Valkey, allowing any instance to handle any request.

**Architecture:**
```
          ┌─────────────┐
          │Load Balancer│
          └──────┬──────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
┌────▼───┐  ┌───▼────┐  ┌───▼────┐
│Backend │  │Backend │  │Backend │
│   1    │  │   2    │  │   3    │
└────┬───┘  └───┬────┘  └───┬────┘
     │          │           │
     └──────────┼───────────┘
                │
      ┌─────────┴─────────┐
      │                   │
┌─────▼─────┐      ┌──────▼──────┐
│PostgreSQL │      │   Valkey     │
│ (Primary) │      │  (Cluster)  │
└───────────┘      └─────────────┘
```

**Implementation Steps:**

1. **Make Application Stateless:**
All session data must be stored in Valkey or PostgreSQL, not in application memory. FastAPI instances should not share any local state.

```python
# BAD: Storing state in global variable
cache = {}  # This will not work across multiple instances

# GOOD: Using Valkey for shared state
@app.on_event("startup")
async def startup():
    app.state.redis = await aioredis.from_url("valkey://valkey:6379")
```

2. **Configure Load Balancer:**
Use NGINX, AWS ALB, or Cloudflare Load Balancing to distribute requests across instances. Configure health checks to remove unhealthy instances from the pool.

```nginx
upstream backend {
    least_conn;  # Route to instance with fewest connections
    server backend-1:8000 max_fails=3 fail_timeout=30s;
    server backend-2:8000 max_fails=3 fail_timeout=30s;
    server backend-3:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. **Deploy Multiple Instances:**
Use Docker Compose, Kubernetes, or a PaaS like Railway/Render to run multiple instances. Set auto-scaling rules based on CPU or request rate.

```yaml
# docker-compose.yml
services:
  backend:
    image: url-shortener-backend
    deploy:
      replicas: 3  # Run 3 instances
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Vertical Scaling (Short-term)

Vertical scaling is appropriate as a temporary measure when you need immediate performance improvement but do not have time to implement horizontal scaling. It works well up to a certain point but becomes cost-ineffective beyond 8-16 CPU cores.

**When to Use:**
- Initial scaling from 100 to 1,000 RPS
- Quick fix for performance issues
- Database server scaling (easier than sharding)

**Implementation:**
Simply increase instance size in your cloud provider. For example, upgrading from a 2-core, 4GB instance to a 4-core, 8GB instance.

**Limitations:**
- Cost increases exponentially (doubling resources often more than doubles cost)
- Single point of failure (no redundancy)
- Hard limits (cannot infinitely scale a single machine)
- Downtime required for upgrades

---

## Database Scaling

### Index Optimization

Proper indexing is the most impactful database optimization. Every query should use an index to avoid full table scans.

**Critical Indexes:**
```sql
-- Redirect queries (most frequent)
CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);

-- User's URLs queries
CREATE INDEX idx_urls_user_id ON urls(user_id);

-- Analytics time-range queries
CREATE INDEX idx_clicks_url_id_time ON clicks(url_id, clicked_at DESC);

-- Geographic analytics
CREATE INDEX idx_clicks_country ON clicks(country);

-- Composite index for common join
CREATE INDEX idx_clicks_composite ON clicks(url_id, clicked_at DESC, country);
```

**Monitoring Index Usage:**
```sql
-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

### Read Replicas

As read traffic grows, a single PostgreSQL instance becomes a bottleneck. Read replicas allow you to distribute read queries across multiple database servers while writes still go to the primary.

**Architecture:**
```
       ┌──────────────┐
       │   Primary    │
       │  PostgreSQL  │ ◄── All writes
       └──────┬───────┘
              │
         Replication
              │
     ┌────────┼────────┐
     │        │        │
┌────▼────┐ ┌▼────────┐ ┌▼────────┐
│Replica 1│ │Replica 2│ │Replica 3│ ◄── Read queries
└─────────┘ └─────────┘ └─────────┘
```

**Read-Write Splitting:**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Primary database for writes
primary_engine = create_engine("postgresql://primary:5432/urlshortener")
PrimarySession = sessionmaker(bind=primary_engine)

# Replica for reads
replica_engine = create_engine("postgresql://replica:5432/urlshortener")
ReplicaSession = sessionmaker(bind=replica_engine)

# Use primary for writes
async def create_url(url_data: URLCreate, user_id: UUID):
    async with PrimarySession() as session:
        url = URL(**url_data.dict(), user_id=user_id)
        session.add(url)
        await session.commit()
        return url

# Use replica for reads
async def get_user_urls(user_id: UUID):
    async with ReplicaSession() as session:
        result = await session.execute(
            select(URL).where(URL.user_id == user_id)
        )
        return result.scalars().all()
```

**Replication Lag Considerations:**
Replicas are eventually consistent, meaning there is a small delay (typically 1-100ms) between a write to the primary and its appearance on replicas. For URL shorteners, this is acceptable because:
- URL redirects can be cached, avoiding replica reads entirely
- Analytics queries tolerate slight staleness
- User dashboards can tolerate 1-second delay

However, for critical reads (e.g., immediately after creating a URL), you should read from the primary or implement read-your-writes consistency.

### Connection Pooling

Creating a new database connection for every request is expensive (50-100ms overhead). Connection pooling maintains a pool of reusable connections, reducing latency to sub-1ms.

**Implementation:**
```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "postgresql://localhost/urlshortener",
    poolclass=QueuePool,
    pool_size=20,          # Keep 20 connections open
    max_overflow=10,       # Allow 10 additional connections under load
    pool_pre_ping=True,    # Verify connection health before use
    pool_recycle=3600      # Recycle connections every hour
)
```

**Sizing Guidelines:**
- **pool_size:** Number of concurrent requests / Number of backend instances
- For 100 concurrent requests across 5 instances: pool_size = 20
- For 1000 concurrent requests across 10 instances: pool_size = 100

### Table Partitioning

As the clicks table grows beyond 10 million rows, queries slow down even with proper indexes. Table partitioning divides the table into smaller, more manageable pieces.

**Partitioning by Time:**
```sql
-- Create parent table
CREATE TABLE clicks (
    id UUID DEFAULT gen_random_uuid(),
    url_id UUID NOT NULL,
    clicked_at TIMESTAMP NOT NULL,
    country VARCHAR(2),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    referrer TEXT
) PARTITION BY RANGE (clicked_at);

-- Create partitions for each month
CREATE TABLE clicks_2024_01 PARTITION OF clicks
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE clicks_2024_02 PARTITION OF clicks
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Continue for each month...
```

**Benefits:**
- Queries that filter by date only scan relevant partitions
- Old partitions can be archived or deleted efficiently
- Indexes are smaller, improving performance

**Automatic Partition Management:**
```python
from datetime import datetime, timedelta

async def create_monthly_partition(db: Session):
    """
    Creates a new partition for the next month.
    
    Should be run monthly via cron or scheduler.
    """
    next_month = datetime.now() + timedelta(days=30)
    partition_name = f"clicks_{next_month.strftime('%Y_%m')}"
    
    query = f"""
    CREATE TABLE IF NOT EXISTS {partition_name}
    PARTITION OF clicks
    FOR VALUES FROM ('{next_month.strftime('%Y-%m-01')}')
                  TO ('{(next_month + timedelta(days=31)).strftime('%Y-%m-01')}');
    """
    
    await db.execute(text(query))
    await db.commit()
```

### Query Optimization

Poorly written queries can be 10-100x slower than optimized queries. Always use EXPLAIN ANALYZE to understand query execution.

**Slow Query Example:**
```sql
-- SLOW: Fetches all rows, then filters in Python
SELECT * FROM clicks WHERE url_id = $1;

-- In Python
clicks = await db.execute(query)
recent_clicks = [c for c in clicks if c.clicked_at > datetime.now() - timedelta(days=7)]
```

**Optimized Query:**
```sql
-- FAST: Filters at database level with index
SELECT * FROM clicks 
WHERE url_id = $1 
  AND clicked_at > NOW() - INTERVAL '7 days'
ORDER BY clicked_at DESC
LIMIT 100;
```

**Using EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT country, COUNT(*) 
FROM clicks 
WHERE url_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY country;

-- Output:
-- Seq Scan on clicks  (cost=0.00..100000.00 rows=1000000 width=10) (actual time=0.123..456.789 rows=1000000 loops=1)
--   Filter: (url_id = '550e8400-e29b-41d4-a716-446655440000')
-- Planning Time: 0.234 ms
-- Execution Time: 567.890 ms
```

If you see "Seq Scan" (sequential scan), you need an index. If you see "Index Scan" or "Bitmap Index Scan", the query is optimized.

---

## Caching at Scale

### Multi-Level Caching

A production URL shortener should implement multiple caching layers to minimize database load and reduce latency.

**Layer 1: CDN/Edge Cache (Cloudflare, AWS CloudFront)**
Caches redirect responses at edge locations closest to users. Reduces latency from 100ms to 10ms for users far from your data center.

**Layer 2: Application-Level Cache (Valkey)**
Caches URL mappings, rate limit counters, and session data. Shared across all backend instances.

**Layer 3: In-Memory Cache (Python dict/LRU)**
Caches extremely hot URLs (top 1000) in application memory for sub-millisecond access. Must be used carefully to avoid memory exhaustion.

### Valkey Clustering

As traffic grows, a single Valkey instance becomes a bottleneck. Valkey Cluster distributes data across multiple nodes using hash-based sharding.

**Architecture:**
```
┌─────────────────────────────────────┐
│         Valkey Cluster               │
│                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  │ Master 1│  │ Master 2│  │ Master 3│
│  │Slots    │  │Slots    │  │Slots    │
│  │0-5460   │  │5461-    │  │10923-   │
│  │         │  │10922    │  │16383    │
│  └────┬────┘  └────┬────┘  └────┬────┘
│       │            │            │      │
│  ┌────▼────┐  ┌───▼─────┐  ┌───▼─────┐
│  │Replica 1│  │Replica 2│  │Replica 3│
│  └─────────┘  └─────────┘  └─────────┘
└─────────────────────────────────────┘
```

**Implementation:**
```python
from redis.cluster import RedisCluster

# Connect to Valkey Cluster
redis_cluster = RedisCluster(
    startup_nodes=[
        {"host": "valkey-node-1", "port": 6379},
        {"host": "valkey-node-2", "port": 6379},
        {"host": "valkey-node-3", "port": 6379},
    ],
    decode_responses=True,
    skip_full_coverage_check=True
)

# Use exactly like single Valkey instance
await redis_cluster.set("url:abc123", "https://example.com")
```

**Cluster automatically handles:**
- Data distribution across nodes
- Failover when a master node fails
- Rebalancing when adding/removing nodes

### Cache Eviction Policies

Valkey supports multiple eviction policies when memory is full. For a URL shortener, the appropriate policy depends on access patterns.

**LRU (Least Recently Used):**
Evicts the least recently accessed keys. Best for URL shorteners because popular URLs (recently accessed) remain cached while old, rarely-accessed URLs are evicted.

```valkey
CONFIG SET maxmemory-policy allkeys-lru
```

**LFU (Least Frequently Used):**
Evicts keys with the lowest access frequency. Better than LRU for workloads with stable hot keys.

```valkey
CONFIG SET maxmemory-policy allkeys-lfu
```

**Cache Size Calculation:**
- Average URL mapping: ~500 bytes (short_code + original_url + metadata)
- For 1 million cached URLs: 500 bytes × 1M = 500 MB
- Add 50% overhead for Valkey data structures: 750 MB
- Recommended: 1 GB RAM for 1 million URLs

### Cache Warming Strategies

Cold cache after deployment causes a spike in database load as all requests become cache misses. Cache warming pre-populates the cache to prevent this.

**Strategy 1: Warmup on Startup**
```python
async def warm_cache_on_startup():
    """
    Pre-loads hot URLs into cache.
    
    Runs once when application starts.
    """
    # Get top 10,000 most-clicked URLs from past 7 days
    hot_urls = await db.execute(
        select(URL.short_code, URL.original_url)
        .join(Click)
        .where(Click.clicked_at >= datetime.now() - timedelta(days=7))
        .group_by(URL.id)
        .order_by(func.count(Click.id).desc())
        .limit(10000)
    )
    
    # Load into Valkey
    for url in hot_urls:
        await redis.set(f"url:{url.short_code}", url.original_url, ex=86400)
```

**Strategy 2: Lazy Warming**
Do not pre-load cache. Instead, populate cache on first access (cache miss). This is simpler but causes higher database load initially.

**Strategy 3: Scheduled Warming**
Run a background job every hour to refresh hot URLs in cache. This prevents cache expiration for popular URLs.

### Cache Invalidation

Cache invalidation is critical for consistency. When a URL is deleted or deactivated, the cache must be updated immediately.

**Invalidation Events:**
- URL deleted → Delete from cache
- URL deactivated → Delete from cache
- URL modified (future: custom alias changed) → Update cache

**Implementation:**
```python
async def delete_url(short_code: str, db: Session, redis: Redis):
    """
    Deletes URL and invalidates cache.
    
    Ensures cache consistency with database.
    """
    # Delete from database
    await db.execute(delete(URL).where(URL.short_code == short_code))
    await db.commit()
    
    # Invalidate cache
    await redis.delete(f"url:{short_code}")
    
    # If using CDN, purge edge cache
    # await cloudflare.purge_cache(f"https://sho.rt/{short_code}")
```

**Cache-Aside Pattern:**
This is the standard caching pattern used by the system:

1. Application checks cache for data
2. If cache miss, fetch from database
3. Store in cache for future requests
4. Return data to user

```python
async def get_original_url(short_code: str, redis: Redis, db: Session) -> str:
    """
    Implements cache-aside pattern.
    """
    # Check cache
    cached = await redis.get(f"url:{short_code}")
    if cached:
        return cached
    
    # Cache miss: query database
    result = await db.execute(
        select(URL.original_url).where(URL.short_code == short_code)
    )
    original_url = result.scalar_one_or_none()
    
    if not original_url:
        raise HTTPException(status_code=404)
    
    # Store in cache
    await redis.set(f"url:{short_code}", original_url, ex=86400)
    
    return original_url
```

---

## Load Balancing

### Load Balancing Algorithms

The load balancer distributes incoming requests across multiple backend instances. Different algorithms optimize for different goals.

**Round Robin:**
Distributes requests evenly across all instances in sequence. Simple but does not consider instance load.

```nginx
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}
```

**Least Connections:**
Routes requests to the instance with the fewest active connections. Better than round robin when request processing time varies.

```nginx
upstream backend {
    least_conn;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}
```

**IP Hash:**
Routes requests from the same IP to the same instance. Useful for session affinity, but not needed for stateless applications like ours.

```nginx
upstream backend {
    ip_hash;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}
```

**Weighted Load Balancing:**
Assigns different weights to instances based on their capacity. Use when instances have different resources.

```nginx
upstream backend {
    server backend-1:8000 weight=3;  # 8-core instance
    server backend-2:8000 weight=2;  # 4-core instance
    server backend-3:8000 weight=1;  # 2-core instance
}
```

### Health Checks

The load balancer must detect unhealthy instances and remove them from the pool to prevent routing requests to failing servers.

**Active Health Checks:**
Load balancer periodically sends requests to the health check endpoint.

```nginx
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
    
    # Health check configuration
    check interval=5000 rise=2 fall=3 timeout=2000;
}
```

**Health Check Endpoint:**
```python
@app.get("/health")
async def health_check(db: Session = Depends(get_db), redis: Valkey = Depends(get_redis)):
    """
    Health check endpoint.
    
    Returns:
        200 OK: All dependencies healthy
        503 Service Unavailable: One or more dependencies unhealthy
    """
    try:
        # Check database
        await db.execute(text("SELECT 1"))
        
        # Check Valkey
        await redis.ping()
        
        return {
            "status": "healthy",
            "database": "connected",
            "cache": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy", "error": str(e)}
        )
```

### Session Persistence

For stateless applications like our URL shortener, session persistence is not required. However, if you add features that require sticky sessions (e.g., WebSocket connections), you can enable it.

**NGINX Sticky Sessions:**
```nginx
upstream backend {
    least_conn;
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}
```

---

## CDN Integration

### Why Use a CDN?

A CDN (Content Delivery Network) caches content at edge locations around the world, reducing latency for users far from your origin server. For a URL shortener, CDN integration can reduce redirect latency from 200ms to 20ms for international users.

**Without CDN:**
```
User (Tokyo) → Origin Server (US East) → 200ms latency
```

**With CDN:**
```
User (Tokyo) → CDN Edge (Tokyo) → 10ms latency
```

### Cloudflare Integration

Cloudflare provides free CDN with generous limits, making it ideal for URL shorteners.

**Setup Steps:**

1. **Add Domain to Cloudflare:**
Point your domain's nameservers to Cloudflare.

2. **Configure Caching:**
Create a Page Rule to cache redirect responses.

```
Page Rule: sho.rt/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
Browser Cache TTL: 4 hours
```

3. **Enable Tiered Caching:**
Cloudflare's upper tier data centers cache content, reducing load on your origin.

4. **Purge Cache on URL Deletion:**
When a URL is deleted or deactivated, purge it from Cloudflare's cache.

```python
import httpx

async def purge_cloudflare_cache(short_code: str):
    """
    Purges a specific URL from Cloudflare's cache.
    """
    url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache"
    
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "files": [f"https://sho.rt/{short_code}"]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        return response.json()
```

### Cache Headers

Set appropriate cache headers to control how CDNs and browsers cache responses.

**For Redirects (cacheable):**
```python
@app.get("/{short_code}")
async def redirect_to_url(short_code: str, response: Response):
    original_url = await get_original_url(short_code)
    
    # Set cache headers
    response.headers["Cache-Control"] = "public, max-age=2592000"  # 30 days
    response.headers["CDN-Cache-Control"] = "max-age=2592000"
    
    return RedirectResponse(url=original_url, status_code=301)
```

**For API Responses (not cacheable):**
```python
@app.get("/api/urls")
async def get_user_urls(response: Response):
    urls = await fetch_user_urls()
    
    # Prevent caching of dynamic data
    response.headers["Cache-Control"] = "private, no-cache, no-store, must-revalidate"
    
    return urls
```

### Geographic Distribution

Choose a CDN provider with edge locations near your users. Cloudflare has 275+ data centers worldwide, ensuring low latency globally.

**Latency by Region:**
```
North America: 10-30ms
Europe:        10-30ms
Asia:          10-30ms
South America: 20-50ms
Africa:        30-60ms
Oceania:       20-40ms
```

---

## Monitoring & Observability

### Key Metrics to Track

Effective monitoring requires tracking the right metrics. For a URL shortener, focus on latency, throughput, error rate, and resource utilization.

**Application Metrics:**
- Request rate (requests per second)
- Redirect latency (p50, p95, p99)
- API endpoint latency
- Error rate (4xx, 5xx responses)
- Cache hit ratio
- Database query latency

**Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Network bandwidth
- Disk I/O
- Database connections
- Valkey memory usage

### Logging Strategy

Implement structured logging for easy parsing and analysis.

**Log Format (JSON):**
```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "path": record.pathname,
            "function": record.funcName,
        }
        
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        
        if hasattr(record, 'short_code'):
            log_data["short_code"] = record.short_code
        
        return json.dumps(log_data)

# Configure logging
logger = logging.getLogger("url_shortener")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

**Request Logging:**
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration * 1000,
            "user_agent": request.headers.get("user-agent")
        }
    )
    
    return response
```

### Application Performance Monitoring (APM)

While full APM tools like New Relic or Datadog are overkill for Tier 1, implementing basic performance tracking is valuable.

**Request Duration Tracking:**
```python
from prometheus_client import Histogram
import time

# Define histogram metric
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint', 'status']
)

@app.middleware("http")
async def track_performance(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).observe(duration)
    
    return response
```

### Error Tracking

Use Sentry (free tier) for error tracking and alerting.

**Sentry Integration:**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/project-id",
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # Sample 10% of transactions
    environment="production"
)

# Errors are automatically captured
@app.get("/{short_code}")
async def redirect(short_code: str):
    try:
        url = await get_url(short_code)
    except Exception as e:
        # Automatically sent to Sentry
        raise
```

### Alerting

Set up alerts for critical issues that require immediate attention.

**Alert Conditions:**
- Error rate > 1% for 5 minutes
- p95 latency > 500ms for 5 minutes
- Database connection failures
- Valkey connection failures
- Disk usage > 90%
- Memory usage > 90%

**Simple Alerting with Bash:**
```bash
#!/bin/bash
# Check if error rate exceeds threshold

ERROR_RATE=$(curl -s http://localhost:8000/metrics | grep http_errors | awk '{print $2}')

if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\": \"⚠️ High error rate: $ERROR_RATE\"}"
fi
```

---

## Scaling Milestones

### Milestone 1: 100 RPS (Initial Launch)

**Characteristics:**
- Single backend instance
- Single PostgreSQL instance
- Single Valkey instance
- No load balancer (direct connection)
- Approximately 8.6 million requests per day

**Infrastructure:**
```
- Backend: 1 instance (2 CPU, 4GB RAM)
- PostgreSQL: 1 instance (2 CPU, 4GB RAM, 20GB SSD)
- Valkey: 1 instance (1 CPU, 2GB RAM)
- Total cost: ~$30-50/month on Railway/Render
```

**Bottlenecks:**
- None at this scale
- Cache hit ratio should be > 95%
- Average latency: 50-100ms

**Action Items:**
- Implement basic monitoring
- Set up error tracking (Sentry)
- Ensure all queries are indexed

---

### Milestone 2: 1,000 RPS (Growing Product)

**Characteristics:**
- 86 million requests per day
- Database becoming a bottleneck
- Need for horizontal scaling

**Infrastructure:**
```
- Backend: 3 instances (2 CPU, 4GB RAM each)
- Load Balancer: NGINX or AWS ALB
- PostgreSQL: 1 primary + 1 read replica (4 CPU, 8GB RAM)
- Valkey: 1 instance (2 CPU, 4GB RAM)
- Total cost: ~$150-200/month
```

**Optimizations Required:**
- Add read replica for analytics queries
- Implement connection pooling (pool_size=50)
- Enable Valkey persistence (AOF)
- Add CDN for redirect caching

**Scaling Actions:**
```python
# Enable read-write splitting
DATABASES = {
    'primary': 'postgresql://primary:5432/db',
    'replica': 'postgresql://replica:5432/db'
}

# Route analytics queries to replica
async def get_analytics(short_code: str):
    async with get_session(database='replica') as session:
        # Complex aggregation queries
        ...
```

**Expected Performance:**
- Redirect latency: 20-50ms
- Cache hit ratio: > 98%
- Database CPU: 40-60%

---

### Milestone 3: 10,000 RPS (Popular Service)

**Characteristics:**
- 864 million requests per day
- High database load
- Need for advanced caching and partitioning

**Infrastructure:**
```
- Backend: 10 instances (4 CPU, 8GB RAM each)
- Load Balancer: AWS ALB or Cloudflare
- PostgreSQL: 1 primary + 3 read replicas (8 CPU, 16GB RAM)
- Valkey: 3-node cluster (4 CPU, 8GB RAM each)
- CDN: Cloudflare (caching redirects)
- Total cost: ~$800-1,200/month
```

**Optimizations Required:**
- Implement table partitioning for clicks table
- Upgrade Valkey to cluster mode for higher throughput
- Implement aggressive edge caching via CDN
- Use database connection pooling with pgBouncer

**Scaling Actions:**
```sql
-- Partition clicks table by month
CREATE TABLE clicks_2024_01 PARTITION OF clicks
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Add partial indexes for common queries
CREATE INDEX idx_clicks_recent 
ON clicks (url_id, clicked_at DESC) 
WHERE clicked_at >= NOW() - INTERVAL '30 days';
```

**Expected Performance:**
- Redirect latency: 10-20ms (via CDN)
- Cache hit ratio: > 99%
- Database CPU: 60-80%
- Valkey memory usage: 4-6GB

---

### Milestone 4: 100,000 RPS (Enterprise Scale)

**Characteristics:**
- 8.6 billion requests per day
- Multi-region deployment required
- Database sharding needed

**Infrastructure:**
```
- Backend: 100+ instances across multiple regions
- Load Balancer: Cloudflare + regional load balancers
- PostgreSQL: Sharded across 10+ instances
- Valkey: Large cluster (10+ nodes)
- CDN: Global edge caching
- Total cost: ~$5,000-10,000/month
```

**Advanced Optimizations:**
- Database sharding by short_code hash
- Multi-region deployment for low latency globally
- Separate analytics database (data warehouse)
- Implement write batching for click tracking
- Use message queue (Kafka) for asynchronous processing

**Database Sharding:**
```python
def get_shard_for_short_code(short_code: str) -> int:
    """
    Determines which database shard stores this short code.
    
    Uses consistent hashing to distribute URLs across shards.
    """
    hash_value = int(hashlib.md5(short_code.encode()).hexdigest(), 16)
    return hash_value % NUM_SHARDS

# Route queries to appropriate shard
shard_id = get_shard_for_short_code("abc123")
async with get_shard_connection(shard_id) as db:
    url = await db.execute(select(URL).where(URL.short_code == "abc123"))
```

**Expected Performance:**
- Redirect latency: 5-10ms (via CDN)
- Cache hit ratio: > 99.5%
- Database queries per shard: ~10,000 QPS
- Valkey requests per node: ~20,000 QPS

---

## Cost Optimization

### Right-Sizing Resources

Over-provisioning wastes money. Under-provisioning causes outages. Finding the right balance requires monitoring and gradual scaling.

**CPU Sizing:**
Monitor CPU utilization over 7 days. If average is below 30%, downgrade instance size. If it exceeds 70% during peak hours, upgrade.

**Memory Sizing:**
Applications should use 60-80% of available memory under normal load. If consistently above 85%, upgrade. If below 50%, downgrade.

**Database Sizing:**
PostgreSQL performance degrades when dataset exceeds available RAM. Ensure your database instance has enough RAM to cache the working set (frequently accessed data).

```sql
-- Check database cache hit ratio
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- Target ratio: > 0.99 (99% cache hits)
```

### Auto-Scaling

Implement auto-scaling to handle traffic spikes without over-provisioning for peak load.

**Kubernetes Horizontal Pod Autoscaler:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Benefits:**
- Cost savings: Scale down during low traffic
- Reliability: Scale up automatically during spikes
- No manual intervention required

### Reserved Instances vs On-Demand

For predictable, steady-state load, use reserved instances (AWS Reserved Instances, GCP Committed Use Discounts) for up to 60% savings. For variable load, use auto-scaling with on-demand instances.

**Example:**
- Reserve 3 backend instances for baseline load (always running)
- Use auto-scaling for 0-10 additional instances during peaks

### Database Cost Optimization

**Strategy 1: Use Managed Services Wisely**
Managed databases (AWS RDS, GCP Cloud SQL) are expensive. For lower environments (dev/staging), use smaller instances or self-managed PostgreSQL.

**Strategy 2: Optimize Storage**
Use gp3 SSD (AWS) instead of io2 for databases that do not require extremely high IOPS. This saves 50% on storage costs with minimal performance impact.

**Strategy 3: Archive Old Data**
Clicks older than 1 year are rarely accessed. Archive them to cheaper object storage (S3 Glacier) and delete from the database.

```python
async def archive_old_clicks():
    """
    Archives clicks older than 1 year to S3.
    """
    one_year_ago = datetime.now() - timedelta(days=365)
    
    # Export to CSV
    old_clicks = await db.execute(
        select(Click).where(Click.clicked_at < one_year_ago)
    )
    
    # Upload to S3
    await s3.upload_file("clicks_archive_2023.csv")
    
    # Delete from database
    await db.execute(
        delete(Click).where(Click.clicked_at < one_year_ago)
    )
```

### CDN Cost Optimization

Cloudflare offers unlimited bandwidth on the free plan, making it ideal for URL shorteners. However, if using AWS CloudFront or other paid CDNs, optimize costs by:
- Setting longer cache TTLs to reduce origin requests
- Compressing responses (gzip/brotli)
- Using cache keys efficiently to maximize hit ratio

---

## Conclusion

Scaling a URL shortener from 100 RPS to 100,000 RPS requires a systematic approach focused on caching, database optimization, and horizontal scaling. The key principles are:

**1. Optimize Before Scaling:** Fix inefficient queries and add indexes before adding more servers.

**2. Cache Aggressively:** URL redirects are read-heavy and highly cacheable. Aim for 99%+ cache hit ratio.

**3. Scale Horizontally:** Add more backend instances rather than upgrading to larger instances.

**4. Monitor Everything:** You cannot optimize what you do not measure. Track latency, throughput, error rate, and resource utilization.

**5. Plan for Growth:** Design your system to scale from day one. Avoid architectural changes that require full rewrites.

By following this guide, you can build a URL shortener that handles millions of requests per day while maintaining sub-50ms latency and 99.9% uptime, all within a reasonable budget.
