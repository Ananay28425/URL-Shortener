import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

export default function TopUrlsChart({ data = [] }){
  const colors = ['#8b5cf6','#06b6d4','#6366f1','#06b6d4']
  return (
    <div className="card p-4">
      <div className="text-slate-300 text-sm">Top Performing Links</div>
      <div style={{width:'100%', height:240}} className="mt-4">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{fill:'rgba(255,255,255,0.6)'}}/>
            <YAxis dataKey="shortId" type="category" tick={{fill:'rgba(255,255,255,0.8)'}} width={160}/>
            <Tooltip contentStyle={{background:'#0b0f19', border:'1px solid rgba(255,255,255,0.06)'}} itemStyle={{color:'#fff'}}/>
            <Bar dataKey="clicks" barSize={14} radius={[6,6,6,6]}>
              {data.map((entry, idx) => <Cell key={idx} fill={colors[idx % colors.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
