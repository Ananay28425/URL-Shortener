export default function StatsCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'from-brand-indigo/30 to-brand-purple/10',
    success: 'from-brand-success/20 to-transparent',
    warning: 'from-brand-warning/20 to-transparent',
    info: 'from-brand-cyan/20 to-transparent'
  }

  return (
    <article className={`glass-card bg-gradient-to-br ${tones[tone]} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-brand-slate">{hint}</p>}
        </div>
        {Icon ? <Icon size={18} className="text-brand-muted" /> : null}
      </div>
    </article>
  )
}
