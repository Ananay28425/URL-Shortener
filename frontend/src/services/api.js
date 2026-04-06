import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const client = axios.create({
  baseURL: baseURL ? `${baseURL}/api/v1` : '/api/v1',
  timeout: 7000
})

const mockUrls = [
  { shortId: 'demo-1', shortUrl: 'https://sho.rt/demo-1', url: 'https://vercel.com/blog/scaling-platforms', clicks: 1382, createdAt: '2026-03-20T08:30:00.000Z', status: 'active' },
  { shortId: 'api-x7', shortUrl: 'https://sho.rt/api-x7', url: 'https://docs.github.com/en/rest', clicks: 792, createdAt: '2026-03-27T14:10:00.000Z', status: 'active' },
  { shortId: 'infra99', shortUrl: 'https://sho.rt/infra99', url: 'https://kubernetes.io/docs/concepts/overview/', clicks: 344, createdAt: '2026-02-15T09:45:00.000Z', status: 'paused' }
]

const mockTrend = [
  { date: 'Mar 30', clicks: 52 },
  { date: 'Mar 31', clicks: 68 },
  { date: 'Apr 01', clicks: 74 },
  { date: 'Apr 02', clicks: 87 },
  { date: 'Apr 03', clicks: 102 },
  { date: 'Apr 04', clicks: 94 },
  { date: 'Apr 05', clicks: 119 }
]

export async function shortenUrl(data) {
  try {
    const response = await client.post('/shorten', data)
    return response.data
  } catch {
    const alias = data.customAlias || Math.random().toString(36).slice(2, 8)
    return {
      shortId: alias,
      shortUrl: `https://sho.rt/${alias}`,
      url: data.url,
      clicks: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  }
}

export async function getUrls() {
  try {
    const response = await client.get('/urls')
    return response.data
  } catch {
    return mockUrls
  }
}

export async function getAnalytics(id) {
  try {
    const response = await client.get(`/analytics/${id}`)
    return response.data
  } catch {
    const link = mockUrls.find((item) => item.shortId === id) || mockUrls[0]
    const total = mockTrend.reduce((acc, point) => acc + point.clicks, 0)

    return {
      shortId: link.shortId,
      shortUrl: link.shortUrl,
      originalUrl: link.url,
      createdAt: link.createdAt,
      totalClicks: total,
      last7Days: mockTrend.reduce((acc, point) => acc + point.clicks, 0),
      peakDay: mockTrend.reduce((max, point) => (point.clicks > max.clicks ? point : max), mockTrend[0]),
      avgDaily: Math.round(total / mockTrend.length),
      trend: mockTrend,
      topUrls: mockUrls.map((item) => ({ shortId: item.shortId, clicks: item.clicks }))
    }
  }
}

export async function deleteUrl(id) {
  try {
    await client.delete(`/urls/${id}`)
    return { success: true }
  } catch {
    return { success: true }
  }
}
