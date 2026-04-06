import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalyticsChart from '../components/AnalyticsChart'
import CopyButton from '../components/CopyButton'
import LoadingSpinner from '../components/LoadingSpinner'
import StatsCard from '../components/StatsCard'
import TopUrlsChart from '../components/TopUrlsChart'
import { getAnalytics } from '../services/api'
import formatDate from '../utils/formatDate'

export default function Analytics() {
  const { id } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics(id).then(setData)
  }, [id])

  if (!data) {
    return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingSpinner label="Loading analytics" /></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="glass-card mb-5 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Analytics Detail</p>
        <h1 className="mt-2 text-xl font-semibold">{data.shortUrl}</h1>
        <p className="mt-1 text-sm text-brand-muted">{data.originalUrl}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-brand-slate">
          <span>Created {formatDate(data.createdAt)}</span>
          <span>•</span>
          <span>{data.totalClicks} total clicks</span>
          <CopyButton value={data.shortUrl} compact />
        </div>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Clicks" value={data.totalClicks} />
        <StatsCard label="Last 7 Days" value={data.last7Days} tone="info" />
        <StatsCard label="Peak Day" value={`${data.peakDay.date} (${data.peakDay.clicks})`} tone="warning" />
        <StatsCard label="Avg Daily Clicks" value={data.avgDaily} tone="success" />
      </section>

      <section className="grid gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3"><AnalyticsChart data={data.trend} /></div>
        <div className="xl:col-span-2"><TopUrlsChart data={data.topUrls} /></div>
      </section>

      <section className="glass-card mt-5 p-5">
        <h3 className="text-sm font-medium text-brand-muted">Analytics summary</h3>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          This link shows steady growth with a strong recent click trend. Performance spikes indicate campaign bursts,
          while average daily engagement remains healthy for ongoing distribution.
        </p>
      </section>
    </div>
  )
}
