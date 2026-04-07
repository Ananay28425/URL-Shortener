import { useEffect, useMemo, useState } from 'react'
import { getAnalytics } from '../services/api'

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
        const payload = await getAnalytics(shortId)
        if (!mounted) return
        setData(payload)
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
    const fromSeries =
      data?.traffic?.reduce((s, p) => s + (p.unique || 0), 0) ?? 0
    const unique =
      data?.unique_visitors ??
      (fromSeries > 0 ? fromSeries : Math.round(clicks * 0.72))
    return { clicks, unique }
  }, [data])

  return { data, summary, loading, error }
}
