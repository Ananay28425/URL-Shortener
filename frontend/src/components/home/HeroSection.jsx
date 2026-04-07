import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function HeroSection() {
  return (
    <section className="py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/70">
            <Sparkles size={14} className="text-[var(--accent)]" />
            Developer-grade links with analytics
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Shorten Links. Track Everything.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
            Create clean short URLs, monitor performance, and ship campaigns with a
            premium analytics dashboard built for speed.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              as={undefined}
              variant="subtle"
              className="border-[var(--border0)] bg-white/[0.06] hover:bg-white/[0.08]"
              rightIcon={<ArrowRight size={16} />}
              type="button"
              onClick={() => {
                const el = document.getElementById('create-link')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Create Link
            </Button>
            <a
              href="/dashboard"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>

        <Card className="p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white/80">
              System Logs
            </div>
            <div className="text-xs text-white/40">Live</div>
          </div>
          <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/70">
            <div>
              <span className="text-white/40">[router]</span> Ready at{' '}
              <span className="text-white">/api/v1</span>
            </div>
            <div>
              <span className="text-white/40">[shorten]</span> Awaiting request…
            </div>
            <div>
              <span className="text-white/40">[analytics]</span> Streaming events
            </div>
            <div>
              <span className="text-white/40">[cache]</span> Warm path enabled
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

