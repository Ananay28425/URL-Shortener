import React from 'react'
import { Copy } from 'lucide-react'
import copyToClipboard from '../utils/copyToClipboard'
import { useToast } from './ToastProvider'

export default function CopyButton({ text }){
  const { addToast } = useToast()
  async function handle(){
    const ok = await copyToClipboard(text)
    if(ok) addToast({ title: 'Copied to clipboard', message: text, type: 'success' })
    else addToast({ title: 'Copy failed', message: 'Unable to copy to clipboard', type: 'error' })
  }
  return (
    <button onClick={handle} className="p-2 rounded-md bg-white/6 flex items-center gap-2">
      <Copy size={14} />
      <span className="text-slate-300 text-sm">Copy</span>
    </button>
  )
}
