import { motion } from 'framer-motion'

export default function GradientButton({
  children,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      disabled={disabled}
      className={`rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
