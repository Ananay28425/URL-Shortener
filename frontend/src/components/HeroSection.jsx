import { motion } from 'framer-motion'
import GradientButton from './GradientButton'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-12">
      <div className="mx-auto max-w-5xl text-left">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-xs uppercase tracking-[0.3em] text-red-300">
          {`> scalable • analytics • terminal mode`}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Shorten Links. Track Everything.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:text-base"
        >
          Command-center UI for link operations with real-time metrics, strong visual hierarchy, and production-ready workflows.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex items-center gap-3">
          <Link to="/dashboard"><GradientButton>Open Dashboard</GradientButton></Link>
          <Link to="/login" className="btn-secondary">Sign in</Link>
        </motion.div>
      </div>
    </section>
  )
}
