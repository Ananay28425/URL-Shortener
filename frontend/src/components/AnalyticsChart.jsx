import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AnalyticsChart({ data }) {
  return (
    <div className="glass-card h-[340px] p-4">
      <h3 className="mb-4 text-sm font-medium text-brand-muted">Click trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
          <Area type="monotone" dataKey="clicks" stroke="#06B6D4" fill="url(#clickGradient)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
