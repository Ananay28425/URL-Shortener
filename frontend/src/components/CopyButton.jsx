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
      className={`inline-flex items-center gap-1 rounded-md border border-[#333333] bg-[#111111] ${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-xs'} uppercase tracking-wide text-brand-muted hover:text-brand-text ${className}`}
    >
      {copied ? <Check size={14} className="text-brand-success" /> : <Copy size={14} className="text-brand-muted" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
