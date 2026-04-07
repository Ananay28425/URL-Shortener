import React, { useMemo, useState } from 'react'
import { Wand2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import CopyButton from '../ui/CopyButton'
import LoadingSpinner from '../ui/LoadingSpinner'
import { shortenUrl, generateSmartAlias } from '../../services/api'

function normalizeShortResult(result) {
  if (!result) return { shortId: '', shortUrl: '' }
  const shortId = result.shortId || result.short_code || result.id || ''
  const shortUrl =
    result.shortUrl || result.short_url || (shortId ? `${window.location.origin}/${shortId}` : '')
  return { shortId, shortUrl }
}

export default function UrlShortenerForm() {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const short = useMemo(() => normalizeShortResult(result), [result])

  async function onSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    try {
      const payload = await shortenUrl({ url: url.trim(), customAlias: alias.trim() || null })
      setResult(payload)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card id="create-link" className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/80">Create Link</div>
          <div className="mt-1 text-xs text-white/40">
            POST <span className="font-mono">/api/v1/shorten</span>
          </div>
        </div>
        {short.shortUrl ? <CopyButton value={short.shortUrl} label="Copy Link" /> : null}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Destination URL
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/launch/post"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Custom alias (optional)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              className="flex-1"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="my-campaign"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="subtle"
              leftIcon={<Wand2 size={16} className="text-[var(--accent)]" />}
              onClick={async () => {
                const next = alias.trim() || (await generateSmartAlias(url.trim()))
                setAlias(next)
              }}
            >
              Generate Smart Alias
            </Button>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            className="bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
            leftIcon={loading ? <LoadingSpinner size={16} /> : null}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Shorten Link'}
          </Button>
          <div className="text-xs text-white/40">
            Tip: Keep aliases short and readable.
          </div>
        </div>
      </form>

      {short.shortUrl ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Generated short link
          </div>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mono truncate text-sm font-semibold text-white">
                {short.shortUrl}
              </div>
              <div className="mt-1 truncate text-xs text-white/50">{url}</div>
            </div>
            <CopyButton value={short.shortUrl} label="Copy" className="justify-center" />
          </div>
        </div>
      ) : null}
    </Card>
  )
}

