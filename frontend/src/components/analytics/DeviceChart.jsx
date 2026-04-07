import React, { useId } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'
import {
  ACCENT,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from '../../utils/chartHelpers'

const FALLBACK = [
  ACCENT,
  'rgba(255,255,255,0.45)',
  'rgba(255,255,255,0.22)',
  'rgba(243,128,32,0.35)',
]

export default function DeviceChart({ data = [] }) {
  const uid = useId().replace(/:/g, '')
  const safe = (data || []).filter((d) => (d.value || 0) > 0)

  if (safe.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm font-semibold text-white/85">Devices</div>
        <div className="mt-3 text-sm text-white/45">No device breakdown yet — clicks will appear here.</div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white/85">Devices</div>
        <div className="mt-1 text-xs text-white/45">Share by device type</div>
      </div>
      <div className="p-5">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => [value, 'Clicks']}
              />
              <Pie
                data={safe}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
                stroke="rgba(0,0,0,0)"
                animationDuration={400}
              >
                {safe.map((_, idx) => (
                  <Cell key={`${uid}-cell-${idx}`} fill={FALLBACK[idx % FALLBACK.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2">
          {safe.slice(0, 5).map((d, idx) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex min-w-0 items-center gap-2 text-white/70">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: FALLBACK[idx % FALLBACK.length] }}
                />
                <span className="truncate capitalize">{d.name}</span>
              </div>
              <div className="shrink-0 tabular-nums text-white/55">{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
