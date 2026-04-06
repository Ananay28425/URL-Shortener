import React from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard } from 'lucide-react'
import Card from '../ui/Card'

function SideLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/[0.08] text-white'
            : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
        }`
      }
    >
      <span className="text-white/70">{icon}</span>
      <span>{children}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <Card className="p-3">
          <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-white/40">
            Workspace
          </div>
          <nav className="flex flex-col gap-1">
            <SideLink to="/dashboard" icon={<LayoutDashboard size={18} />}>
              Dashboard
            </SideLink>
            <SideLink to="/analytics/alpha" icon={<BarChart3 size={18} />}>
              Analytics
            </SideLink>
          </nav>
          <div className="mt-4 border-t border-white/10 px-3 pt-4">
            <div className="text-xs text-white/40">Status</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All systems normal
            </div>
          </div>
        </Card>
      </div>
    </aside>
  )
}

