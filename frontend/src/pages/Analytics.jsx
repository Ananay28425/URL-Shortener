import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnalyticsChart from '../components/AnalyticsChart'
import CopyButton from '../components/CopyButton'
import LoadingSpinner from '../components/LoadingSpinner'
import StatsCard from '../components/StatsCard'
import TopUrlsChart from '../components/TopUrlsChart'
import { api } from '../services/api'

export default function Analytics() {
  const { shortCode } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [insight, setInsight] = useState('')

  useEffect(() => {
    setError('')
    setData(null)
    api.getAnalytics(shortCode).then(setData).catch((err) => setError(err.message))
  }, [shortCode])

  async function runDiagnostic() {
    setInsight('')
    try {
      await api.getAiInsight(data)
    } catch (err) {
      setInsight(err.message)
    }
  }

  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-brand-error">{error}</div>
  }

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
          <span>{data.totalClicks} total clicks</span>
          <CopyButton value={data.shortUrl} compact />
          <button onClick={runDiagnostic} className="btn-secondary px-3 py-1">Run Diagnostic</button>
        </div>
        {insight && <p className="mt-2 text-sm text-brand-warning">{insight}</p>}
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

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-brand-muted">Browser breakdown</h3>
          <TopUrlsChart data={data.browsers} />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-brand-muted">Device breakdown</h3>
          <TopUrlsChart data={data.devices} />
        </div>
      </section>

      <section className="glass-card mt-5 p-5">
        <h3 className="text-sm font-medium text-brand-muted">Recent click events</h3>
        {data.recentClicks.length === 0 ? (
          <p className="mt-2 text-sm text-brand-muted">No click events recorded yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            {data.recentClicks.slice(0, 5).map((click) => (
              <div key={`${click.timestamp}-${click.ip_address || 'na'}`} className="rounded-lg bg-white/5 px-3 py-2">
                <span>{new Date(click.timestamp).toLocaleString()}</span>
                <span className="mx-2">•</span>
                <span>{click.referer || 'direct'}</span>
                <span className="mx-2">•</span>
                <span>{click.browser || 'unknown'} / {click.device_type || 'unknown'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
