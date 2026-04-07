import React from 'react'
import { useParams } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import CopyButton from '../components/ui/CopyButton'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import TrafficChart from '../components/analytics/TrafficChart'
import DeviceChart from '../components/analytics/DeviceChart'
import GeoChart from '../components/analytics/GeoChart'
import AiInsightCard from '../components/analytics/AiInsightCard'
import { useAnalytics } from '../hooks/useAnalytics'
import formatDate, { formatDateTime } from '../utils/formatDate'

function RecentClicks({ events = [] }) {
  const rows = (events || []).slice(0, 12)
  if (!rows.length) return null
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white/85">Recent click events</div>
        <div className="mt-1 text-xs text-white/45">Latest activity for this short link</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Country</th>
              <th className="px-5 py-3">Referrer</th>
              <th className="px-5 py-3">Device</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((c, i) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-5 py-3 text-white/70">
                  {c.timestamp
                    ? formatDateTime(
                        typeof c.timestamp === 'string'
                          ? c.timestamp
                          : new Date(c.timestamp).toISOString()
                      )
                    : '—'}
                </td>
                <td className="px-5 py-3 text-white/70">{c.country || '—'}</td>
                <td className="max-w-[14rem] truncate px-5 py-3 text-white/60">
                  {c.referer || 'direct'}
                </td>
                <td className="px-5 py-3 capitalize text-white/60">
                  {c.device_type || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { shortId } = useParams()
  const { data, summary, loading, error } = useAnalytics(shortId)

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="inline-flex items-center gap-3 text-white/70">
          <LoadingSpinner />
          Loading analytics…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Couldn’t load analytics"
        description={error?.message || 'Try again in a moment.'}
        action={
          <Button
            variant="primary"
            className="bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        }
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="No analytics found"
        description="This link might not exist yet."
        action={
          <Button as="a" href="/dashboard" variant="subtle">
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  const shortUrl =
    data.shortUrl || `${window.location.origin}/${data.shortId}`

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              <Link2 size={14} className="text-[var(--accent)]" />
              Link analytics
            </div>
            <div className="mt-2 mono truncate text-lg font-semibold text-white">
              {shortUrl}
            </div>
            <div className="mt-1 truncate text-sm text-white/55">
              {data.url || '—'}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
              <span>
                Created {data.created_at ? formatDate(data.created_at) : '—'}
              </span>
              {data.last_clicked_at ? (
                <span>
                  Last click {formatDate(data.last_clicked_at)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={shortUrl} label="Copy Link" />
            <Button as="a" href="/dashboard" variant="subtle">
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Total requests
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {summary.clicks.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Unique visitors
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {summary.unique.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Status
            </div>
            <div className="mt-2 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-200">
              Active
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Top referrer
            </div>
            <div className="mt-2 truncate text-sm font-semibold text-white/75">
              {data.top_referrers?.[0]?.ref || '—'}
            </div>
          </Card>
        </div>
      </Card>

      <TrafficChart data={data.traffic} />

      <div className="grid gap-4 lg:grid-cols-3">
        <DeviceChart data={data.device} />
        <div className="lg:col-span-2">
          <GeoChart data={data.geo} />
        </div>
      </div>

      <RecentClicks events={data.recent_clicks} />

      <AiInsightCard insight={data.ai_insight} />
    </div>
  )
}
