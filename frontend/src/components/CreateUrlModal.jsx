import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import GradientButton from './GradientButton'
import CopyButton from './CopyButton'

export default function CreateUrlModal({ open, onClose, onCreate }) {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const created = await onCreate({ url, customAlias: alias || undefined })
    setResult(created)
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create new short URL</h3>
              <button onClick={onClose} className="btn-secondary p-2"><X size={14} /></button>
            </div>

            <form className="grid gap-3" onSubmit={submit}>
              <input className="input-dark" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/very/long/path" />
              <input className="input-dark" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Alias (optional)" />
              <GradientButton type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate URL'}</GradientButton>
            </form>

            {result?.shortUrl && (
              <div className="mt-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-3 text-sm">
                <p className="text-brand-muted">Generated URL</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs sm:text-sm">{result.shortUrl}</span>
                  <CopyButton value={result.shortUrl} compact />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
