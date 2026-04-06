import { motion } from 'framer-motion'

export default function FeatureCard({ title, description, icon: Icon }) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="glass-card p-6 transition"
    >
      <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/5 p-3">
        <Icon size={18} className="text-brand-cyan" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
    </motion.article>
  )
}
