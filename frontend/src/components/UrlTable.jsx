import React from 'react'
import formatDate from '../utils/formatDate'
import truncateUrl from '../utils/truncateUrl'
import { Copy, BarChart2, Trash2, ExternalLink } from 'lucide-react'
import copyToClipboard from '../utils/copyToClipboard'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastProvider'

export default function UrlTable({ items = [], onDelete }){
  const nav = useNavigate()
  const { addToast } = useToast()

  return (
    <div className="table-wrap card p-4">
      <table className="min-w-full">
        <thead>
          <tr className="text-slate-400 text-sm">
            <th>Short</th>
            <th>Original</th>
            <th>Clicks</th>
            <th>Created</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(i=> (
            <tr key={i.shortId} className="hover:bg-white/3 transition-colors">
              <td className="py-3 align-top"><div className="font-mono text-white">{i.shortUrl || `${window.location.origin}/${i.shortId}`}</div></td>
              <td className="py-3 align-top text-slate-300">{truncateUrl(i.url)}</td>
              <td className="py-3 align-top">{i.clicks ?? 0}</td>
              <td className="py-3 align-top text-slate-400">{formatDate(i.created_at)}</td>
              <td className="py-3 align-top"><span className={`px-2 py-1 rounded text-sm ${i.status === 'active' ? 'bg-emerald-600/20 text-emerald-300' : 'bg-rose-600/20 text-rose-300'}`}>{i.status}</span></td>
              <td className="py-3 align-top">
                <div className="flex gap-2">
                  <button onClick={async()=>{ const v = i.shortUrl || `${window.location.origin}/${i.shortId}`; const ok = await copyToClipboard(v); if(ok) addToast({ title: 'Copied', message: v, type: 'success' }) }} className="p-2 rounded-md bg-white/6"><Copy size={14} /></button>
                  <button onClick={()=>nav(`/analytics/${i.shortId}`)} className="p-2 rounded-md bg-white/6"><BarChart2 size={14} /></button>
                  <button onClick={async()=>{ try{ if(onDelete) await onDelete(i.shortId); addToast({ title: 'Deleted', message: 'Short URL removed', type: 'success' }) }catch(e){ addToast({ title: 'Delete failed', message: e.message || '', type: 'error' }) } }} className="p-2 rounded-md bg-white/6 text-rose-300"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
