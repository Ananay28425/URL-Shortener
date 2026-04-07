import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'

const COLORS = ['var(--accent)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.28)']

export default function DeviceChart({ data = [] }) {
  const safe = (data || []).filter((d) => (d.value || 0) > 0)
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-white/80">Devices</div>
      <div className="mt-1 text-xs text-white/40">Breakdown by device type</div>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                color: 'white',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              itemStyle={{ color: 'white' }}
            />
            <Pie
              data={safe}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              stroke="rgba(0,0,0,0)"
            >
              {safe.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-2">
        {safe.slice(0, 4).map((d, idx) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: COLORS[idx % COLORS.length] }}
              />
              {d.name}
            </div>
            <div className="text-white/60">{d.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

