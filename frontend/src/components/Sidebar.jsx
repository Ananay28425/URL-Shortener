import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BarChart2, PlusSquare, Clock } from 'lucide-react'

export default function Sidebar(){
  return (
    <aside className="hidden lg:block w-64 sticky top-20 h-[calc(100vh-5rem)] p-4">
      <div className="card p-4 h-full flex flex-col gap-6">
        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={({isActive})=>`flex items-center gap-3 p-2 rounded-lg ${isActive? 'bg-white/6 text-white':'text-slate-300 hover:bg-white/3'}`}>
            <Home size={16} /> <span className="text-sm">Overview</span>
          </NavLink>
          <NavLink to="/dashboard" className={({isActive})=>`flex items-center gap-3 p-2 rounded-lg ${isActive? 'bg-white/6 text-white':'text-slate-300 hover:bg-white/3'}`}>
            <BarChart2 size={16} /> <span className="text-sm">Analytics</span>
          </NavLink>
        </nav>

        <div className="mt-auto">
          <div className="text-xs text-slate-400">Performance</div>
          <div className="mt-2 text-white font-medium">99.99% uptime</div>
        </div>
      </div>
    </aside>
  )
}
