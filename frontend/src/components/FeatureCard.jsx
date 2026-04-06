import React from 'react'
import { Zap, BarChart2, Shield } from 'lucide-react'

const ICON_MAP = { zap: Zap, bar: BarChart2, shield: Shield }

export default function FeatureCard({ icon = 'zap', title, desc }){
  const Icon = ICON_MAP[icon] || Zap
  return (
    <div className="p-4 card hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-black">
          <Icon size={18} />
        </div>
        <div>
          <div className="text-white font-semibold">{title}</div>
          <div className="text-slate-300 text-sm">{desc}</div>
        </div>
      </div>
    </div>
  )
}
