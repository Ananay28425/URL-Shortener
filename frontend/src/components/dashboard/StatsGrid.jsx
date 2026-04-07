import React, { useMemo } from 'react'
import { Activity, BarChart3, Link2, MousePointerClick } from 'lucide-react'
import StatsCard from './StatsCard'

export default function StatsGrid({ urls = [] }) {
  const stats = useMemo(() => {
    const totalLinks = urls.length
    const totalClicks = urls.reduce((s, u) => s + (u.clicks || 0), 0)
    const active = urls.filter((u) => (u.status || 'active') === 'active').length
    const top = urls.reduce(
      (best, u) => ((u.clicks || 0) > (best.clicks || 0) ? u : best),
      urls[0] || { shortId: '—', clicks: 0 }
    )
    return {
      totalLinks,
      totalClicks,
      active,
      topClicks: top?.clicks || 0,
      topId: top?.shortId || '—',
    }
  }, [urls])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        label="Total Links"
        value={stats.totalLinks}
        icon={<Link2 size={18} />}
      />
      <StatsCard
        label="Total Clicks"
        value={stats.totalClicks.toLocaleString()}
        icon={<MousePointerClick size={18} />}
      />
      <StatsCard
        label="Active Links"
        value={stats.active}
        hint="Currently enabled"
        icon={<Activity size={18} />}
      />
      <StatsCard
        label="Top Link Clicks"
        value={stats.topClicks.toLocaleString()}
        hint={stats.topId !== '—' ? `Top: ${stats.topId}` : undefined}
        icon={<BarChart3 size={18} />}
      />
    </div>
  )
}

