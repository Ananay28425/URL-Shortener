import React from 'react'
import { NavLink } from 'react-router-dom'
import { Link2 } from 'lucide-react'

const linkBase =
  'text-sm font-medium text-white/60 hover:text-white transition-colors'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Link2 size={18} className="text-white/80" />
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold tracking-tight">URL Shortener</div>
            <div className="text-xs text-white/40">Analytics-driven links</div>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-white' : ''}`
            }
          >
            Create
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-white' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/analytics/alpha"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-white' : ''}`
            }
          >
            Analytics
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded-md border border-white/10 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-black'
                  : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.07] hover:text-white'
              }`
            }
          >
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

