import React, { useState } from 'react'
import { shortenUrl } from '../services/api'
import { Copy } from 'lucide-react'
import copyToClipboard from '../utils/copyToClipboard'
import { useToast } from './ToastProvider'

export default function UrlForm(){
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e){
    e && e.preventDefault()
    if(!url) return
    setLoading(true)
    try{
      const payload = await shortenUrl({ url, customAlias: alias })
      setResult(payload)
      const short = payload.shortUrl || (payload.shortId ? `${window.location.origin}/${payload.shortId}` : '')
      addToast({ title: 'Short URL created', message: short, type: 'success' })
    }catch(err){
      console.error(err)
      addToast({ title: 'Failed', message: err.message || 'Could not shorten URL', type: 'error' })
    }finally{ setLoading(false) }
  }

  const { addToast } = useToast()
  async function handleCopy(){
    if(!result) return
    const value = result.shortUrl || (result.shortId ? `${window.location.origin}/${result.shortId}` : '')
    const ok = await copyToClipboard(value)
    if(ok) addToast({ title: 'Copied', message: value, type: 'success' })
    else addToast({ title: 'Copy failed', message: 'Unable to copy', type: 'error' })
  }

  return (
    <div className="card p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="text-sm text-slate-300">Long URL</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/very/long/url" className="w-full p-3 rounded-lg bg-black/30 border border-white/6 text-white" />

        <div className="flex gap-3">
          <input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="custom-alias (optional)" className="flex-1 p-3 rounded-lg bg-black/30 border border-white/6 text-white" />
          <button type="submit" className="px-4 py-3 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black font-semibold">{loading? 'Shortening…' : 'Shorten'}</button>
        </div>
      </form>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-white/3 border border-white/6 flex items-center justify-between">
          <div>
            <div className="text-slate-300 text-sm">Short URL</div>
            <div className="font-mono text-white">{result.shortUrl || `${result.shortId ? `${window.location.origin}/${result.shortId}` : ''}`}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="p-2 rounded-md bg-white/6">
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
