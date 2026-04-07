export default function StatsCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="glass-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-brand-slate">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-brand-text">{value}</p>
          {hint && <p className="mt-1 text-xs text-brand-slate">{hint}</p>}
        </div>
        {Icon ? <Icon size={16} className="text-brand-muted" /> : null}
      </div>
    </article>
  )
}
