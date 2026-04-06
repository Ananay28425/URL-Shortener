import React, { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import copyToClipboard from '../../utils/copyToClipboard'

export default function CopyButton({ value, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)

  const text = useMemo(() => (value == null ? '' : String(value)), [value])

  async function onCopy() {
    if (!text) return
    const ok = await copyToClipboard(text)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.07] hover:text-white transition-colors ${className}`}
    >
      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
      <span className="font-medium">{copied ? 'Copied' : label}</span>
    </button>
  )
}

