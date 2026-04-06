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
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      disabled={disabled}
      className={`rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan px-6 py-3 font-semibold text-white shadow-glow transition-all disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
