import { BarChart3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import formatDate from '../utils/formatDate'
import truncateUrl from '../utils/truncateUrl'
import CopyButton from './CopyButton'

export default function UrlTable({ items, onDelete }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-left text-brand-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Short URL</th>
              <th className="px-4 py-3 font-medium">Original URL</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.shortCode || item.shortId} className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-xs sm:text-sm">{item.shortUrl}</td>
                <td className="px-4 py-3 text-brand-muted">{truncateUrl(item.url, 56)}</td>
                <td className="px-4 py-3">{item.clicks}</td>
                <td className="px-4 py-3 text-brand-muted">{formatDate(item.createdAt || item.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${item.status === 'active' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-warning/20 text-brand-warning'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CopyButton value={item.shortUrl} compact />
                    <Link to={`/analytics/${item.shortCode || item.shortId}`} className="btn-secondary p-2"><BarChart3 size={14} /></Link>
                    <button onClick={() => onDelete(item.shortCode || item.shortId)} className="btn-secondary p-2 text-brand-error"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
