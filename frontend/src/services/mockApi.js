/**
 * Mock / fallback data when the API is unavailable or for features without a backend yet.
 */

const MOCK_URLS = [
  {
    shortId: 'demo1',
    shortUrl: 'https://short.example/demo1',
    url: 'https://example.com/blog/fast-indexing',
    clicks: 1245,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: 'active',
  },
  {
    shortId: 'alpha',
    shortUrl: 'https://short.example/alpha',
    url: 'https://vercel.com/docs',
    clicks: 842,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: 'active',
  },
  {
    shortId: 'dev-99',
    shortUrl: 'https://short.example/dev-99',
    url: 'https://github.com/Ananay28425/URL-Shortener',
    clicks: 312,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: 'inactive',
  },
]

function randomTrend(days = 14) {
  const now = Date.now()
  return Array.from({ length: days }).map((_, i) => ({
    date: new Date(now - (days - i - 1) * 24 * 3600 * 1000).toISOString().slice(0, 10),
    requests: Math.max(0, Math.round(Math.random() * 40 + i * 3)),
    unique: Math.max(0, Math.round((Math.random() * 30 + i * 2) * 0.75)),
  }))
}

function dictToDevicePairs(device_breakdown) {
  if (!device_breakdown || typeof device_breakdown !== 'object') return []
  return Object.entries(device_breakdown).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }))
}

function dictToGeoPairs(top_countries) {
  if (!top_countries || typeof top_countries !== 'object') return []
  return Object.entries(top_countries).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }))
}

/**
 * Heuristic smart alias from a destination URL (client-side).
 */
export function generateSmartAlias(url) {
  try {
    const u = new URL(url)
    const base = (u.hostname + u.pathname)
      .replace(/^www\./, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24)
    return base || Math.random().toString(36).slice(2, 8)
  } catch {
    return Math.random().toString(36).slice(2, 8)
  }
}

export function mockListUrls() {
  return MOCK_URLS.map((u) => ({ ...u }))
}

export function mockShorten({ url, customAlias }) {
  const shortId =
    (customAlias && String(customAlias).replace(/[^a-zA-Z0-9_-]/g, '')) ||
    Math.random().toString(36).slice(2, 8)
  return {
    shortId,
    shortUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${shortId}`,
    url,
    clicks: 0,
    created_at: new Date().toISOString(),
  }
}

export function mockAnalytics(shortCode) {
  const top_countries = { US: 412, IN: 120, GB: 72, DE: 44 }
  return {
    shortId: shortCode,
    shortUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${shortCode}`,
    url: `https://example.com/demo/${shortCode}`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    total_clicks: Math.round(Math.random() * 500 + 200),
    last_clicked_at: new Date().toISOString(),
    traffic: randomTrend(20),
    device: dictToDevicePairs({ desktop: 540, mobile: 120, tablet: 40 }),
    geo: dictToGeoPairs(top_countries),
    top_referrers: [
      { ref: 'twitter.com', clicks: 230 },
      { ref: 'reddit.com', clicks: 80 },
      { ref: 'direct', clicks: 120 },
    ],
    recent_clicks: [],
    ai_insight: null,
  }
}

/**
 * Optional “AI Performance Insight” copy when no backend endpoint exists yet.
 */
export async function mockAiInsight({
  shortId,
  total_clicks: totalClicks,
  traffic,
  top_referrers: topReferrers,
}) {
  const topRef = topReferrers?.[0]?.ref || 'direct'
  const recentDays = traffic?.length || 0
  const peak =
    traffic?.reduce((m, p) => Math.max(m, p.requests || 0), 0) ?? 0
  return `Link “${shortId}” has ${totalClicks ?? 0} total clicks. Top traffic source: ${topRef}. ${
    recentDays
      ? `Recent activity spans ${recentDays} days (peak ${peak} requests/day).`
      : ''
  } Consider sharing on high-intent channels to compound growth.`
}
