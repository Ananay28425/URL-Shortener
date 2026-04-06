import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TopUrlsChart({ data }) {
  return (
    <div className="glass-card h-[340px] p-4">
      <h3 className="mb-4 text-sm font-medium text-brand-muted">Performance breakdown</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
          <XAxis dataKey="shortId" stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
          <Bar dataKey="clicks" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
