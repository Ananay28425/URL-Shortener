const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const API_PREFIX = `${API_BASE}/api/v1`

async function _request(path, opts = {}) {
  const res = await fetch(`${API_PREFIX}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const detail = payload && payload.detail ? payload.detail : payload
    throw new Error(detail || 'Request failed')
  }
  return payload
}

// Mock fallback data so UI works without backend
const MOCK_URLS = [
  { shortId: 'x1aB2', shortUrl: 'https://short.ly/x1aB2', url: 'https://example.com/blog/fast-indexing', clicks: 1245, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), status: 'active' },
  { shortId: 'alpha', shortUrl: 'https://short.ly/alpha', url: 'https://vercel.com/docs', clicks: 842, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), status: 'active' },
  { shortId: 'dev-99', shortUrl: 'https://short.ly/dev-99', url: 'https://github.com/Ananay28425/URL-Shortener', clicks: 312, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), status: 'inactive' },
]

function randomTrend(days = 14) {
  const now = Date.now()
  return Array.from({ length: days }).map((_, i) => ({
    date: new Date(now - (days - i - 1) * 24 * 3600 * 1000).toISOString().slice(0, 10),
    clicks: Math.max(0, Math.round(Math.random() * 40 + (i * 3)))
  }))
}

export async function shortenUrl({ url, customAlias }) {
  try {
    const payload = await _request('/shorten', { method: 'POST', body: JSON.stringify({ url, custom_alias: customAlias || null }) })
    return payload
  } catch (err) {
    // fallback mock
    const shortId = (customAlias && customAlias.replace(/[^a-zA-Z0-9_-]/g, '')) || Math.random().toString(36).slice(2, 8)
    const shortUrl = `${API_BASE.replace(/https?:\/\//, 'https://')} /${shortId}`.replace(/\s+/g, '')
    return { shortId, shortUrl }
  }
}

export async function getAllUrls() {
  try {
    // try expected endpoint first
    return await _request('/urls')
  } catch (_) {
    try {
      // legacy backend uses /shorten list
      return await _request('/shorten')
    } catch (err) {
      // return mock
      return MOCK_URLS
    }
  }
}

export async function deleteUrl(shortId) {
  try {
    return await _request(`/urls/${shortId}`, { method: 'DELETE' })
  } catch (_) {
    try {
      return await _request(`/shorten/${shortId}`, { method: 'DELETE' })
    } catch (err) {
      return null
    }
  }
}

export async function getAnalytics(shortId) {
  try {
    return await _request(`/analytics/${shortId}`)
  } catch (err) {
    // fallback mock analytics
    return {
      shortId,
      url: `https://example.com/demo/${shortId}`,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      total_clicks: Math.round(Math.random() * 500 + 200),
      trend: randomTrend(20),
      top_countries: [{ country: 'US', clicks: 412 }, { country: 'IN', clicks: 120 }, { country: 'GB', clicks: 72 }],
      top_referrers: [{ ref: 'twitter.com', clicks: 230 }, { ref: 'reddit.com', clicks: 80 }],
      top_devices: [{ device: 'Desktop', clicks: 540 }, { device: 'Mobile', clicks: 120 }]
    }
  }
}

export { API_BASE }
