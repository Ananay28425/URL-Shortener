import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, message = '', type = 'info', duration = 3500 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6)
    const t = { id, title, message, type }
    setToasts((s) => [...s, t])
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), duration)
    return id
  }, [])

  const removeToast = useCallback((id) => setToasts((s) => s.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full max-w-sm card p-3 bg-black/70 border border-white/6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  {t.message && <div className="text-sm text-slate-300 mt-1 break-words">{t.message}</div>}
                </div>
                <button onClick={() => removeToast(t.id)} className="text-slate-300 p-1"><X size={16} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
