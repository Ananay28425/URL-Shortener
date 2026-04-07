import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export default function useUrls() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getUrls()
      setUrls(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload) => {
    const created = await api.shorten(payload.url, payload.customAlias)
    setUrls((prev) => [created, ...prev])
    return created
  }, [])

  const remove = useCallback(async (shortCode) => {
    await api.deleteUrl(shortCode)
    setUrls((prev) => prev.filter((item) => item.shortCode !== shortCode))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const totalClicks = urls.reduce((acc, item) => acc + (item.clicks || 0), 0)
    const active = urls.filter((item) => item.status === 'active').length
    return {
      total: urls.length,
      totalClicks,
      active,
      top: urls.slice().sort((a, b) => b.clicks - a.clicks)[0]?.shortCode || '—'
    }
  }, [urls])

  return { urls, setUrls, loading, create, remove, stats }
}
