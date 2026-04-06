import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteUrl, getUrls, shortenUrl } from '../services/api'

export default function useUrls() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getUrls()
    setUrls(data)
    setLoading(false)
  }, [])

  const create = useCallback(async (payload) => {
    const created = await shortenUrl(payload)
    setUrls((prev) => [created, ...prev])
    return created
  }, [])

  const remove = useCallback(async (id) => {
    await deleteUrl(id)
    setUrls((prev) => prev.filter((item) => item.shortId !== id))
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
      top: urls.slice().sort((a, b) => b.clicks - a.clicks)[0]?.shortId || '—'
    }
  }, [urls])

  return { urls, setUrls, loading, create, remove, stats }
}
