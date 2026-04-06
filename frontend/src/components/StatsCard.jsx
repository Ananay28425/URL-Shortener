export default function StatsCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'border-red-500/50',
    success: 'border-green-500/45',
    warning: 'border-amber-500/45',
    info: 'border-red-400/55'
  }

  return (
    <article className={`glass-card p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/60">{hint}</p>}
        </div>
        {Icon ? <Icon size={16} className="text-red-300" /> : null}
      </div>
    </article>
  )
}
