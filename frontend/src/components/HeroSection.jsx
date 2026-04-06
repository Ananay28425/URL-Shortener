import { motion } from 'framer-motion'
import GradientButton from './GradientButton'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-16">
      <div className="mx-auto max-w-5xl text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-xs uppercase tracking-[0.25em] text-brand-slate">
          Scalable & Analytics-Driven
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Shorten Links. Track Everything.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-brand-muted sm:text-base"
        >
          Ship shareable links in seconds and monitor performance with a premium, real-time analytics console.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex items-center justify-center gap-3">
          <Link to="/dashboard"><GradientButton>Open Dashboard</GradientButton></Link>
          <Link to="/login" className="btn-secondary">Sign in</Link>
        </motion.div>
      </div>
    </section>
  )
}
