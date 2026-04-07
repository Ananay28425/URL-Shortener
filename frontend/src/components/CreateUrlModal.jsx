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
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const created = await onCreate({ url, customAlias: alias || undefined })
      setResult(created)
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="w-full max-w-lg rounded-md border border-[#333333] bg-[#050505] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">Create URL</h3>
              <button onClick={onClose} className="btn-secondary p-2"><X size={12} /></button>
            </div>

            <form className="grid gap-3" onSubmit={submit}>
              <input className="input-dark" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/path" />
              <input className="input-dark" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="alias (optional)" />
              <GradientButton type="submit" disabled={loading}>{loading ? 'Generating' : 'Generate URL'}</GradientButton>
            </form>

            {error && <p className="mt-2 text-xs text-brand-error">{error}</p>}

            {result?.shortUrl && (
              <div className="mt-3 rounded-md border border-[#333333] bg-[#111111] p-3 text-xs">
                <p className="text-brand-slate uppercase tracking-wide">Generated</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="break-all text-brand-text">{result.shortUrl}</span>
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
