import { useEffect, useMemo, useState } from 'react'
import { getAnalytics } from '../services/api'

function normalizeAnalytics(raw, shortId) {
  const url = raw?.url || raw?.original_url || raw?.destination_url || ''
  const created_at = raw?.created_at || raw?.createdAt || null
  const total_clicks = raw?.total_clicks ?? raw?.totalClicks ?? 0
  const trend = Array.isArray(raw?.trend)
    ? raw.trend
    : Array.isArray(raw?.timeseries)
      ? raw.timeseries
      : []

  const traffic = trend.map((p) => ({
    date: p.date || p.day || p.ts || '',
    requests: p.clicks ?? p.requests ?? 0,
    unique: p.unique ?? Math.max(0, Math.round((p.clicks ?? p.requests ?? 0) * 0.7)),
  }))

  const top_devices = raw?.top_devices || raw?.devices || []
  const device = top_devices.map((d) => ({
    name: d.device || d.name || 'Unknown',
    value: d.clicks ?? d.value ?? 0,
  }))

  const top_countries = raw?.top_countries || raw?.countries || []
  const geo = top_countries.map((c) => ({
    name: c.country || c.name || 'Unknown',
    value: c.clicks ?? c.value ?? 0,
  }))

  return {
    shortId: raw?.shortId || raw?.short_code || shortId,
    url,
    created_at,
    total_clicks,
    traffic,
    device,
    geo,
    top_referrers: raw?.top_referrers || [],
    ai_insight: raw?.ai_insight || raw?.insight || null,
  }
}

export function useAnalytics(shortId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const raw = await getAnalytics(shortId)
        if (!mounted) return
        setData(normalizeAnalytics(raw, shortId))
      } catch (e) {
        if (!mounted) return
        setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [shortId])

  const summary = useMemo(() => {
    const clicks = data?.total_clicks ?? 0
    const unique = data?.traffic?.reduce((s, p) => s + (p.unique || 0), 0) || Math.round(clicks * 0.7)
    return { clicks, unique }
  }, [data])

  return { data, summary, loading, error }
}

