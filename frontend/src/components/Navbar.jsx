import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import GradientButton from './GradientButton'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/login', label: 'Login' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0f19]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-sm font-semibold tracking-wide text-brand-text">
          url<span className="text-brand-cyan">.forge</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm ${isActive ? 'text-white' : 'text-brand-muted hover:text-white'}`}>
              {item.label}
            </NavLink>
          ))}
          <GradientButton className="py-2">Create URL</GradientButton>
        </nav>

        <button onClick={() => setOpen((v) => !v)} className="btn-secondary md:hidden" aria-label="Open menu">
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-bgSoft/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="text-brand-muted hover:text-white">
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
