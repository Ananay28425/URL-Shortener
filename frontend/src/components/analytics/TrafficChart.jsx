import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../ui/Card'

export default function TrafficChart({ data = [] }) {
  return (
    <Card className="p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/80">
            Performance Overview
          </div>
          <div className="mt-1 text-xs text-white/40">
            Requests and unique visitors
          </div>
        </div>
      </div>

      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="req" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="uni" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.10)' }}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.10)' }}
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
            <Area
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#req)"
            />
            <Area
              type="monotone"
              dataKey="unique"
              name="Unique"
              stroke="rgba(255,255,255,0.60)"
              strokeWidth={1.5}
              fill="url(#uni)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

