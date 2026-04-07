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
import {
  ACCENT,
  axisLine,
  axisTick,
  gridStroke,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from '../../utils/chartHelpers'

export default function GeoChart({ data = [] }) {
  const safe = (data || []).slice(0, 8)

  if (safe.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm font-semibold text-white/85">Geo distribution</div>
        <div className="mt-3 text-sm text-white/45">
          No country data yet — geo is derived from recent click events.
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white/85">Geo distribution</div>
        <div className="mt-1 text-xs text-white/45">Top countries by clicks</div>
      </div>
      <div className="p-5">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safe}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid stroke={gridStroke} horizontal={false} />
              <XAxis
                type="number"
                tick={axisTick}
                axisLine={axisLine}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => [value, 'Clicks']}
              />
              <Bar
                dataKey="value"
                fill={ACCENT}
                radius={[0, 10, 10, 0]}
                barSize={14}
                animationDuration={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
