import { useState } from 'react'
import GradientButton from './GradientButton'
import CopyButton from './CopyButton'
import { generateSmartAlias } from '../services/api'

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
      const generated = await generateSmartAlias(url.trim())
      setCustomAlias(generated.alias || '')
    } catch (err) {
      setAiMessage(err.message)
    }
  }

  return (
    <div>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-dark" placeholder="https://example.com/long-url" autoFocus />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="input-dark" placeholder="custom alias (optional)" />
          <button type="button" onClick={handleAutoAlias} className="btn-secondary">AI Alias</button>
        </div>
        <GradientButton type="submit" disabled={loading}>{loading ? 'Creating' : 'Create Short URL'}</GradientButton>
      </form>

      {error && <p className="mt-2 text-xs text-brand-error">{error}</p>}
      {aiMessage && <p className="mt-2 text-xs text-brand-warning">{aiMessage}</p>}

      {result?.shortUrl && (
        <div className="mt-3 rounded-md border border-[#333333] bg-[#050505] p-3">
          <p className="text-[11px] uppercase tracking-wide text-brand-slate">Generated Link</p>
          <div className="mt-2 flex items-center gap-2">
            <a href={result.shortUrl} target="_blank" rel="noreferrer" className="flex-1 break-all text-xs text-brand-text underline">{result.shortUrl}</a>
            <CopyButton value={result.shortUrl} compact />
          </div>
        </div>
      )}
    </div>
  )
}
