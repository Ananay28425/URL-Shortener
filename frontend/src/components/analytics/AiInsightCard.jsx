import React from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../ui/Card'

export default function AiInsightCard({ insight }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Sparkles size={16} className="text-[var(--accent)]" />
          AI Performance Insight
        </div>
        <div className="text-xs text-white/40">Optional</div>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-white/60">
        {insight ||
          'No AI insight available yet. This section will show an optional summary once the backend provides it.'}
      </div>
    </Card>
  )
}

