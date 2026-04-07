import { useEffect, useMemo, useState } from 'react'
import { deleteUrl, getAllUrls } from '../services/api'

export function useUrls() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllUrls()
      setUrls(Array.isArray(data) ? data : data?.items || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function remove(shortId) {
    await deleteUrl(shortId)
    setUrls((s) => s.filter((u) => u.shortId !== shortId))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const totalLinks = urls.length
    const totalClicks = urls.reduce((s, u) => s + (u.clicks || 0), 0)
    const active = urls.filter((u) => (u.status || 'active') === 'active').length
    return { totalLinks, totalClicks, active }
  }, [urls])

  return { urls, setUrls, stats, loading, error, refresh, remove }
}

