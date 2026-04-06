import { motion } from 'framer-motion'

export default function GradientButton({ children, className = '', type = 'button', disabled = false, ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      disabled={disabled}
      className={`rounded-sm border border-red-400/70 bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
