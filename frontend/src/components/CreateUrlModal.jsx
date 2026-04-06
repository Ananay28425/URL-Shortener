import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { shortenUrl } from '../services/api'
import { useToast } from './ToastProvider'

export default function CreateUrlModal({ open, onClose, onCreated }){
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function handleCreate(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await shortenUrl({ url, customAlias: alias })
      onCreated && onCreated(res)
      try{ addToast({ title: 'Short URL created', message: res.shortUrl || (res.shortId ? `${window.location.origin}/${res.shortId}` : ''), type: 'success' }) }catch(e){}
      setUrl('')
      setAlias('')
      onClose && onClose()
    }catch(err){ console.error(err) }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
          <motion.div initial={{y:24, scale:0.98}} animate={{y:0, scale:1}} exit={{y:24, scale:0.98}} className="relative w-full max-w-xl p-6 card">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Create Short URL</h3>
              <button onClick={onClose}><X /></button>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
              <label className="text-sm text-slate-300">Long URL</label>
              <input className="p-3 rounded-lg bg-black/30 border border-white/6 text-white" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/…" />
              <label className="text-sm text-slate-300">Custom alias (optional)</label>
              <input className="p-3 rounded-lg bg-black/30 border border-white/6 text-white" value={alias} onChange={e=>setAlias(e.target.value)} placeholder="demo-link" />

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-white/6">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 font-semibold">{loading? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
