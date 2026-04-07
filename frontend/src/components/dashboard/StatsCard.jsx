import React from 'react'
import Card from '../ui/Card'

export default function StatsCard({ label, value, hint, icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          {hint ? <div className="mt-1 text-xs text-white/40">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--accent)]">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

