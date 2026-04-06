import { useState } from 'react'
import GradientButton from './GradientButton'
import CopyButton from './CopyButton'

export default function UrlForm({ onSubmit, loading, result }) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    await onSubmit({ url: url.trim(), customAlias: customAlias.trim() || undefined })
  }

  return (
    <div className="glass-card p-5 sm:p-6">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-dark" placeholder="Paste a long URL" />
        <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="input-dark" placeholder="Custom alias (optional)" />
        <GradientButton type="submit" disabled={loading}>{loading ? 'Creating…' : 'Shorten URL'}</GradientButton>
      </form>

      {result?.shortUrl && (
        <div className="mt-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-3">
          <p className="text-xs text-brand-muted">Generated short URL</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <a href={result.shortUrl} target="_blank" rel="noreferrer" className="font-mono text-sm text-brand-text underline-offset-4 hover:underline">
              {result.shortUrl}
            </a>
            <CopyButton value={result.shortUrl} compact />
          </div>
        </div>
      )}
    </div>
  )
}
