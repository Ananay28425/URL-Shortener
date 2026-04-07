import React from 'react'
import { BarChart3, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import CopyButton from '../ui/CopyButton'
import truncateUrl from '../../utils/truncateUrl'
import formatDate from '../../utils/formatDate'

function StatusPill({ status }) {
  const s = (status || 'active').toLowerCase()
  const active = s === 'active'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${
        active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-white/10 bg-white/[0.04] text-white/60'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function UrlTable({ items = [], onDelete }) {
  const nav = useNavigate()

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white/80">Links</div>
        <div className="mt-1 text-xs text-white/40">
          Copy, inspect analytics, or delete links.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3">Short Link</th>
              <th className="px-5 py-3">Original URL</th>
              <th className="px-5 py-3">Clicks</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((i) => {
              const shortUrl = i.shortUrl || `${window.location.origin}/${i.shortId}`
              return (
                <tr key={i.shortId} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="mono max-w-[18rem] truncate font-semibold text-white">
                      {shortUrl}
                    </div>
                    <div className="mt-1 text-xs text-white/40">{i.shortId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[34rem] truncate text-white/70">
                      {truncateUrl(i.url, 74)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/80">{i.clicks ?? 0}</td>
                  <td className="px-5 py-4 text-white/50">
                    {i.created_at ? formatDate(i.created_at) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={i.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <CopyButton value={shortUrl} label="Copy" className="px-2 py-1.5" />
                      <button
                        type="button"
                        onClick={() => nav(`/analytics/${i.shortId}`)}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.07] hover:text-white transition-colors"
                      >
                        <BarChart3 size={16} />
                        Analytics
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(i.shortId)}
                        className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/[0.04] p-2 text-white/70 hover:bg-red-500/15 hover:text-red-200 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

