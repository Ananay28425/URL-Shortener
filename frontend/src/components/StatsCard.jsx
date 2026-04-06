import React from 'react'

export default function StatsCard({ icon, label, value, trend }){
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-300">{label}</div>
          <div className="mt-1 text-2xl font-bold text-white">{value}</div>
        </div>
        {trend && <div className={`text-sm ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{trend}</div>}
      </div>
    </div>
  )
}
