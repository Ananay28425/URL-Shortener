import { BarChart3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import formatDate from '../utils/formatDate'
import truncateUrl from '../utils/truncateUrl'
import CopyButton from './CopyButton'

export default function UrlTable({ items, onDelete }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="border-b border-[#333333] bg-[#050505] text-left text-brand-slate uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 font-medium">Short URL</th>
              <th className="px-3 py-2 font-medium">Original URL</th>
              <th className="px-3 py-2 font-medium">Clicks</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.shortCode || item.shortId} className="border-b border-[#1f1f1f]">
                <td className="px-3 py-2 break-all text-brand-text">{item.shortUrl}</td>
                <td className="px-3 py-2 text-brand-muted">{truncateUrl(item.url, 56)}</td>
                <td className="px-3 py-2">{item.clicks}</td>
                <td className="px-3 py-2 text-brand-muted">{formatDate(item.createdAt || item.created_at)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-md border px-2 py-1 text-[11px] uppercase tracking-wide ${item.status === 'active' ? 'border-brand-success text-brand-success' : 'border-brand-warning text-brand-warning'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <CopyButton value={item.shortUrl} compact />
                    <Link to={`/analytics/${item.shortCode || item.shortId}`} className="btn-secondary p-2"><BarChart3 size={12} /></Link>
                    <button onClick={() => onDelete(item.shortCode || item.shortId)} className="btn-secondary p-2 text-brand-error"><Trash2 size={12} /></button>
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
