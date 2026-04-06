import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AnalyticsChart({ data }) {
  return (
    <div className="glass-card h-[340px] p-4">
      <h3 className="mb-4 text-sm uppercase tracking-widest text-red-300">Click trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.65} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(239,68,68,0.25)" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#ffffff" fontSize={12} />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip contentStyle={{ background: '#080808', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 4, color: '#fff' }} />
          <Area type="monotone" dataKey="clicks" stroke="#ef4444" fill="url(#clickGradient)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
