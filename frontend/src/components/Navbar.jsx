import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analytics/demo-1', label: 'Analytics' },
  { to: '/login', label: 'Login' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-red-500/50 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold uppercase tracking-widest text-white">
          URL<span className="text-red-400"> Shortener</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm uppercase tracking-wide ${isActive ? 'text-red-300' : 'text-white/80 hover:text-red-200'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => setOpen((v) => !v)} className="btn-secondary md:hidden" aria-label="Open menu">
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-red-500/50 bg-black px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="text-sm uppercase text-white/80 hover:text-red-200">
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
