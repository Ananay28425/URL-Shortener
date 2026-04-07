import { useState } from 'react'
import GradientButton from './GradientButton'
import CopyButton from './CopyButton'
import { api } from '../services/api'

export default function UrlForm({ onSubmit, loading, result, error }) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [aiMessage, setAiMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    await onSubmit({ url: url.trim(), customAlias: customAlias.trim() || undefined })
  }

  async function handleAutoAlias() {
    setAiMessage('')
    try {
      const generated = await api.generateSmartAlias(url.trim())
      setCustomAlias(generated.alias || '')
    } catch (err) {
      setAiMessage(err.message)
    }
  }

  return (
    <div>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-dark"
          placeholder="Enter your long URL here"
          autoFocus
        />
        <div className="flex gap-2">
          <input
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            className="input-dark"
            placeholder="Optional: Custom alias"
          />
          <button type="button" onClick={handleAutoAlias} className="btn-secondary px-4">Auto</button>
        </div>
        <GradientButton type="submit" disabled={loading} className="px-8 py-3.5 text-base">
          {loading ? 'Creating…' : 'Create Short Link'}
        </GradientButton>
      </form>

      {error && <p className="mt-3 text-sm text-brand-error">{error}</p>}
      {aiMessage && <p className="mt-3 text-sm text-brand-warning">{aiMessage}</p>}

      {result?.shortUrl && (
        <div className="mt-6 rounded-xl border border-brand-success/40 bg-gradient-to-br from-brand-success/15 to-brand-success/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-success">Success</p>
          <p className="text-sm text-brand-muted mt-1">Your short link is ready to share</p>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-base text-brand-text bg-white/5 rounded-lg px-4 py-2.5 border border-white/10 hover:bg-white/10 transition flex-1"
            >
              {result.shortUrl}
            </a>
            <CopyButton value={result.shortUrl} compact />
          </div>
        </div>
      )}
    </div>
  )
}
