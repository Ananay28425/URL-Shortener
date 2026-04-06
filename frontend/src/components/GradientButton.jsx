import { motion } from 'framer-motion'

export default function GradientButton({ children, className = '', type = 'button', disabled = false, ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      disabled={disabled}
      className={`rounded-sm border border-red-400/80 bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
