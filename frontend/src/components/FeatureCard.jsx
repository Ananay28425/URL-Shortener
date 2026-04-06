import { motion } from 'framer-motion'

export default function FeatureCard({ title, description, icon: Icon }) {
  return (
    <motion.article
      whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.4)' }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 transition-all hover:from-white/8 hover:to-white/4"
    >
      <div className="mb-6 inline-flex rounded-lg border border-white/15 bg-white/5 p-2.5">
        <Icon size={20} className="text-brand-indigo" />
      </div>
      <h3 className="text-xl font-semibold leading-tight text-brand-text">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-brand-muted">{description}</p>
    </motion.article>
  )
}
