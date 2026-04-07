const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

async function parseResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    if (!response.ok) throw new Error(text || `Request failed with status ${response.status}`)
    return text
  }

  try {
    return await response.json()
  } catch {
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    return null
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    })
  } catch {
    throw new Error('Unable to reach backend server')
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' && 'detail' in payload ? payload.detail : null
    throw new Error(detail || `Request failed with status ${response.status}`)
  }
  return payload
}

function mapUrl(item) {
  return {
    id: item.short_code,
    shortCode: item.short_code,
    shortId: item.short_code,
    shortUrl: item.short_url,
    url: item.original_url,
    originalUrl: item.original_url,
    createdAt: item.created_at,
    clicks: item.click_count ?? 0,
    status: item.is_active === false ? 'inactive' : 'active'
  }
}

function toDateLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function buildTrend(recentClicks = []) {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push(date)
  }

  const counts = new Map(days.map((day) => [toDateLabel(day), 0]))
  recentClicks.forEach((click) => {
    const key = toDateLabel(new Date(click.timestamp))
    if (counts.has(key)) counts.set(key, counts.get(key) + 1)
  })

  return Array.from(counts.entries()).map(([date, clicks]) => ({ date, clicks }))
}

function toChartList(breakdown = {}) {
  return Object.entries(breakdown || {}).map(([shortId, clicks]) => ({ shortId, clicks }))
}

export async function shortenUrl(url, alias) {
  const payload = await request('/api/v1/shorten', {
    method: 'POST',
    body: JSON.stringify({ url, custom_alias: alias || null })
  })
  return mapUrl(payload)
}

export async function getAllUrls() {
  const payload = await request('/api/v1/shorten')
  return Array.isArray(payload) ? payload.map(mapUrl) : []
}

export async function deleteUrl(shortCode) {
  await request(`/api/v1/shorten/${shortCode}`, { method: 'DELETE' })
  return { success: true }
}

export async function getAnalytics(shortCode) {
  const payload = await request(`/api/v1/analytics/${shortCode}`)
  const trend = buildTrend(payload.recent_clicks || [])
  const last7Days = trend.reduce((sum, point) => sum + point.clicks, 0)
  const peakDay = trend.reduce((max, point) => (point.clicks > max.clicks ? point : max), trend[0] || { date: '—', clicks: 0 })

  return {
    shortCode: payload.short_code,
    shortUrl: payload.short_url,
    originalUrl: payload.original_url,
    totalClicks: payload.total_clicks ?? 0,
    last7Days,
    peakDay,
    avgDaily: trend.length ? Math.round(last7Days / trend.length) : 0,
    trend,
    topUrls: toChartList(payload.top_referrers),
    browsers: toChartList(payload.browser_breakdown),
    devices: toChartList(payload.device_breakdown),
    recentClicks: payload.recent_clicks || []
  }
}

export async function generateSmartAlias() {
  throw new Error('AI backend route not implemented yet')
}

export async function getAiInsight() {
  throw new Error('AI backend route not implemented yet')
}

export const api = {
  shorten: shortenUrl,
  getUrls: getAllUrls,
  deleteUrl,
  getAnalytics,
  generateSmartAlias,
  getAiInsight
}
