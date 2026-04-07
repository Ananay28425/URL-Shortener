import React, { useId } from 'react'
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
import {
  ACCENT,
  axisLine,
  axisTick,
  chartGradientIds,
  gridStroke,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from '../../utils/chartHelpers'

function formatTick(v) {
  if (v == null || v === '') return ''
  const s = String(v)
  return s.length > 6 ? s.slice(5) : s
}

export default function TrafficChart({ data = [] }) {
  const uid = useId().replace(/:/g, '')
  const { primary, secondary } = chartGradientIds(`traffic-${uid}`)
  const hasPoints = Array.isArray(data) && data.some((p) => (p?.requests || 0) > 0 || (p?.unique || 0) > 0)

  if (!hasPoints) {
    return (
      <Card className="p-6">
        <div className="text-sm font-semibold text-white/85">Performance Overview</div>
        <div className="mt-3 text-sm text-white/45">
          No traffic series yet — once clicks roll in, you’ll see requests and unique visitors by day.
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white/85">Performance Overview</div>
        <div className="mt-1 text-xs text-white/45">
          Total requests and unique visitors by day
        </div>
      </div>
      <div className="px-2 pb-2 pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={primary} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={secondary} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="date"
                tick={axisTick}
                tickFormatter={formatTick}
                axisLine={axisLine}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value, name) => [value, name === 'requests' ? 'Requests' : 'Unique']}
              />
              <Area
                type="monotone"
                dataKey="requests"
                name="requests"
                stroke={ACCENT}
                strokeWidth={2}
                fill={`url(#${primary})`}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: ACCENT }}
              />
              <Area
                type="monotone"
                dataKey="unique"
                name="unique"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={1.5}
                fill={`url(#${secondary})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
