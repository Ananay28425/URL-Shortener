import { BarChart3, Home, Link2, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const items = [
  { to: '/dashboard', icon: Home, label: 'Overview' },
  { to: '/dashboard', icon: Link2, label: 'Links' },
  { to: '/dashboard', icon: BarChart3, label: 'Analytics' }
]

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      <aside className="hidden h-fit w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:block">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brand-slate">Workspace</p>
        <nav className="space-y-2">
          {items.map(({ to, icon: Icon, label }) => (
            <Link key={label} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${location.pathname === to ? 'bg-white/10 text-white' : 'text-brand-muted hover:bg-white/5 hover:text-white'}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden">
          <aside className="h-full w-72 border-r border-white/10 bg-brand-bgSoft p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Navigation</p>
              <button onClick={onClose} className="btn-secondary p-2"><X size={14} /></button>
            </div>
            <nav className="space-y-2">
              {items.map(({ to, icon: Icon, label }) => (
                <Link key={label} to={to} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${location.pathname === to ? 'bg-white/10 text-white' : 'text-brand-muted hover:bg-white/5 hover:text-white'}`}>
                  <Icon size={16} /> {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
