import { motion } from 'framer-motion'
import GradientButton from './GradientButton'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-brand-slate">
            Build Smarter Shortcuts
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl md:leading-tight"
        >
          URL Shortening That <span className="bg-gradient-to-r from-brand-indigo via-brand-cyan to-brand-purple bg-clip-text text-transparent">Works at Scale</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted"
        >
          Create shareable links instantly. Monitor real-time traffic patterns. Build campaigns with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link to="/dashboard" className="w-full sm:w-auto">
            <GradientButton className="w-full sm:w-auto px-8 py-3 text-base">
              Get Started →
            </GradientButton>
          </Link>
          <Link to="/login" className="btn-secondary w-full sm:w-auto px-8 py-3 text-base">
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-12 sm:grid-cols-3"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-text">100M+</p>
            <p className="mt-1 text-xs text-brand-slate">Links Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-text">99.99%</p>
            <p className="mt-1 text-xs text-brand-slate">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-text">10ms</p>
            <p className="mt-1 text-xs text-brand-slate">Avg Response</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
