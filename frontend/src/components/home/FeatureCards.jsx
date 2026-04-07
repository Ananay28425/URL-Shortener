import React from 'react'
import { BarChart3, Lock, Zap } from 'lucide-react'
import Card from '../ui/Card'

function Feature({ icon, title, description }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/85">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-white/55">
            {description}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function FeatureCards() {
  return (
    <section className="mt-10 grid gap-4 md:grid-cols-3">
      <Feature
        icon={<Zap size={18} className="text-[var(--accent)]" />}
        title="Fast Redirects"
        description="Low-latency redirects with cache-friendly paths and clean slugs."
      />
      <Feature
        icon={<BarChart3 size={18} className="text-[var(--accent)]" />}
        title="Real‑Time Analytics"
        description="See clicks, devices, referrers, and geo distributions at a glance."
      />
      <Feature
        icon={<Lock size={18} className="text-[var(--accent)]" />}
        title="Secure Routing"
        description="Designed for rate-limits, validation, and production hardening."
      />
    </section>
  )
}

