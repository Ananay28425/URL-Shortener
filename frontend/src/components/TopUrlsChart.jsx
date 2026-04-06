import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TopUrlsChart({ data }) {
  return (
    <div className="glass-card h-[340px] p-4">
      <h3 className="mb-4 text-sm uppercase tracking-[0.12em] text-red-300">Performance breakdown</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(239,68,68,0.25)" strokeDasharray="3 3" />
          <XAxis dataKey="shortId" stroke="#fff" fontSize={12} />
          <YAxis stroke="#fff" fontSize={12} />
          <Tooltip contentStyle={{ background: '#080808', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 4, color: '#fff' }} />
          <Bar dataKey="clicks" fill="#dc2626" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
