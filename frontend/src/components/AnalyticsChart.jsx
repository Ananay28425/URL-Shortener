import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AnalyticsChart({ data = [] }){
  return (
    <div className="card p-4">
      <div className="text-slate-300 text-sm">Clicks (Last {data.length} days)</div>
      <div style={{width:'100%', height:260}} className="mt-4">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{fill:'rgba(255,255,255,0.6)'}}/>
            <YAxis tick={{fill:'rgba(255,255,255,0.6)'}} />
            <Tooltip contentStyle={{background:'#0b0f19', border:'1px solid rgba(255,255,255,0.06)'}} itemStyle={{color:'#fff'}}/>
            <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
