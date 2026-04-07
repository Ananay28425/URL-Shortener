import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../ui/Card'

export default function GeoChart({ data = [] }) {
  const safe = (data || []).slice(0, 8)
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-white/80">Geo distribution</div>
      <div className="mt-1 text-xs text-white/40">Top countries by clicks</div>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer>
          <BarChart data={safe} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.10)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              width={64}
            />
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
            <Bar dataKey="value" fill="var(--accent)" radius={[10, 10, 10, 10]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

