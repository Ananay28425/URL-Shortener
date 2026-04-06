import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, message, duration = 2500 }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] grid gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="glass-card max-w-sm px-4 py-3 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.message ? <p className="text-brand-muted">{toast.message}</p> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
