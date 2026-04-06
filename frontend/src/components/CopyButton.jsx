import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import copyToClipboard from '../utils/copyToClipboard'

export default function CopyButton({ value, className = '', compact = false }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    if (!value) return
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} transition hover:bg-white/10 ${className}`}
    >
      {copied ? <Check size={15} className="text-brand-success" /> : <Copy size={15} className="text-brand-muted" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
