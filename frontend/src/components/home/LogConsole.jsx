import React, { useEffect, useMemo, useState } from 'react'
import Card from '../ui/Card'

function nowStamp() {
  const d = new Date()
  return d.toLocaleTimeString(undefined, { hour12: false })
}

export default function LogConsole({ events = [] }) {
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTicks((t) => t + 1), 2500)
    return () => window.clearInterval(id)
  }, [])

  const lines = useMemo(() => {
    const base = [
      { level: 'info', msg: 'Frontend ready', tag: 'ui' },
      { level: 'info', msg: 'Waiting for shorten request', tag: 'shorten' },
      { level: 'info', msg: 'Analytics pipeline armed', tag: 'analytics' },
    ]
    const fromProps = (events || []).slice(-6).map((e) => ({
      level: e.level || 'info',
      msg: e.msg || String(e),
      tag: e.tag || 'event',
    }))
    return [...base, ...fromProps].slice(-8)
  }, [events, ticks])

  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/80">Console</div>
        <div className="text-xs text-white/40">updated</div>
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs">
        {lines.map((l, idx) => (
          <div key={idx} className="flex gap-3 py-1 text-white/70">
            <span className="w-20 shrink-0 text-white/30">{nowStamp()}</span>
            <span className="w-24 shrink-0 text-white/40">[{l.tag}]</span>
            <span className="min-w-0 flex-1 truncate">{l.msg}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-white/40">
        Clean, minimal logs—useful signal without terminal cosplay.
      </div>
    </Card>
  )
}

