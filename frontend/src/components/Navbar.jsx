import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import GradientButton from './GradientButton'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/login', label: 'Sign In' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-bg/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-cyan flex items-center justify-center">
            <span className="text-sm font-bold text-white">uF</span>
          </div>
          <span className="font-bold text-brand-text">url.forge</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
              {item.label}
            </NavLink>
          ))}
          <GradientButton className="px-6 py-2 text-sm">Get Started</GradientButton>
        </nav>

        <button onClick={() => setOpen((v) => !v)} className="btn-secondary md:hidden" aria-label="Open menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-bgSoft/95 px-4 py-4 md:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
                {item.label}
              </NavLink>
            ))}
            <GradientButton className="mt-2 w-full">Get Started</GradientButton>
          </div>
        </div>
      )}
    </header>
  )
}
