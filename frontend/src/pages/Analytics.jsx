import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, Cell, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CopyButton from '../components/CopyButton'
import LoadingSpinner from '../components/LoadingSpinner'
import StatsCard from '../components/StatsCard'
import { getAiInsight, getAnalytics } from '../services/api'

const donutColors = ['#F38020', '#737373', '#22C55E', '#A3A3A3']

export default function Analytics() {
  const { shortCode } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [insight, setInsight] = useState('')

  useEffect(() => {
    setError('')
    setData(null)
    getAnalytics(shortCode).then(setData).catch((err) => setError(err.message))
  }, [shortCode])

  const deviceData = useMemo(() => (data?.devices || []).map((entry) => ({ name: entry.shortId, value: entry.clicks })), [data])

  const geoData = useMemo(() => {
    if (!data) return []
    const bucket = {}
    data.recentClicks.forEach((click) => {
      const key = click.country || 'unknown'
      bucket[key] = (bucket[key] || 0) + 1
    })
    return Object.entries(bucket).map(([name, clicks]) => ({ name, clicks }))
  }, [data])

  async function runDiagnostic() {
    setInsight('')
    try {
      await getAiInsight(data)
    } catch (err) {
      setInsight(err.message)
    }
  }

  if (error) return <div className="mx-auto max-w-7xl px-4 py-4 text-brand-error">{error}</div>
  if (!data) return <div className="mx-auto max-w-7xl px-4 py-4"><LoadingSpinner label="Loading analytics" /></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <header className="mb-4 rounded-md border border-[#333333] bg-[#050505] p-3">
        <p className="text-xs uppercase tracking-wide text-brand-slate">Link Analytics</p>
        <h1 className="mt-1 text-lg font-bold break-all">{data.shortUrl}</h1>
        <p className="mt-1 text-xs text-brand-slate break-all">{data.originalUrl}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton value={data.shortUrl} compact />
          <button onClick={runDiagnostic} className="btn-secondary">Run Diagnostic</button>
        </div>
        {insight && <p className="mt-2 text-xs text-brand-warning">{insight}</p>}
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Clicks" value={data.totalClicks} />
        <StatsCard label="Last 7 Days" value={data.last7Days} />
        <StatsCard label="Peak Day" value={`${data.peakDay.date} (${data.peakDay.clicks})`} />
        <StatsCard label="Avg Daily" value={data.avgDaily} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-brand-slate">Traffic</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <XAxis dataKey="date" stroke="#737373" fontSize={10} />
                <YAxis stroke="#737373" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #333333', borderRadius: 6 }} />
                <Area dataKey="clicks" stroke="#F38020" fill="#F38020" fillOpacity={0.2} />
                <Line dataKey="clicks" stroke="#F38020" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-brand-slate">Devices</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45}>
                  {deviceData.map((_, idx) => <Cell key={idx} fill={donutColors[idx % donutColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #333333', borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-3 lg:col-span-2">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-brand-slate">Geo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData}>
                <XAxis dataKey="name" stroke="#737373" fontSize={10} />
                <YAxis stroke="#737373" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #333333', borderRadius: 6 }} />
                <Bar dataKey="clicks" fill="#F38020" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-md border border-[#333333] bg-[#050505] p-3">
        <h3 className="text-xs uppercase tracking-wide text-brand-slate">AI Insight</h3>
        <p className="mt-2 text-xs text-brand-muted">{insight || 'Run Diagnostic to fetch AI insight for this link.'}</p>
      </section>
    </div>
  )
}
