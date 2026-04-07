import React from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../ui/Card'

export default function AiInsightCard({ insight }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <Sparkles size={16} className="text-[var(--accent)]" />
            AI Performance Insight
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
            Optional
          </div>
        </div>
        <div className="mt-1 text-xs text-white/45">
          Short summary from your metrics (mock until an insight API ships)
        </div>
      </div>
      <div className="px-5 py-4 text-sm leading-relaxed text-white/65">
        {insight ||
          'No AI insight available yet. Wire an insight endpoint to populate this card.'}
      </div>
    </Card>
  )
}
