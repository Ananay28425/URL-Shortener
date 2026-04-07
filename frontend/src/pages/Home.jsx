import { useState } from 'react'
import UrlForm from '../components/UrlForm'
import { shortenUrl } from '../services/api'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState(['[boot] console online', '[network] awaiting request'])

  async function handleShorten(payload) {
    setLoading(true)
    setError('')
    setLogs((prev) => [...prev, `[request] shorten ${payload.url}`])
    try {
      const created = await shortenUrl(payload.url, payload.customAlias)
      setResult(created)
      setLogs((prev) => [...prev, `[success] code=${created.shortCode}`, `[output] ${created.shortUrl}`])
    } catch (err) {
      setResult(null)
      setError(err.message)
      setLogs((prev) => [...prev, `[error] ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <header className="mb-4 border border-[#333333] bg-[#050505] px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-brand-slate">Cloud Console</p>
        <h1 className="mt-1 text-xl font-bold text-brand-text">Create Short Link</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-brand-slate">Link Builder</h2>
          <UrlForm onSubmit={handleShorten} loading={loading} result={result} error={error} />
        </div>

        <div className="rounded-md border border-[#333333] bg-[#050505] p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-brand-slate">Terminal Logs</h2>
          <div className="h-[340px] space-y-1 overflow-y-auto text-xs text-brand-muted">
            {logs.map((line, idx) => (
              <p key={`${line}-${idx}`}>&gt; {line}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
