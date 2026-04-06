import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-black/30 border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
            <span className="text-black font-bold">U</span>
          </div>
          <div>
            <div className="text-white font-semibold">URL Shortener</div>
            <div className="text-sm text-slate-300">Scalable · Analytics</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({isActive})=>`text-sm ${isActive? 'text-white':'text-slate-300 hover:text-white'}`} end>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive})=>`text-sm ${isActive? 'text-white':'text-slate-300 hover:text-white'}`}>Dashboard</NavLink>
          <NavLink to="/analytics/alpha" className={({isActive})=>`text-sm ${isActive? 'text-white':'text-slate-300 hover:text-white'}`}>Analytics</NavLink>
          <NavLink to="/login" className={({isActive})=>`text-sm ${isActive? 'text-white':'text-slate-300 hover:text-white'}`}>Login</NavLink>
        </nav>

        <div className="md:hidden">
          <button aria-label="menu" onClick={()=>setOpen(v=>!v)} className="p-2 rounded-lg bg-white/6">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/6 bg-black/30 px-4 py-3">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={()=>setOpen(false)} className="text-slate-300">Home</Link>
            <Link to="/dashboard" onClick={()=>setOpen(false)} className="text-slate-300">Dashboard</Link>
            <Link to="/analytics/alpha" onClick={()=>setOpen(false)} className="text-slate-300">Analytics</Link>
            <Link to="/login" onClick={()=>setOpen(false)} className="text-slate-300">Login</Link>
          </div>
        </div>
      )}
    </header>
  )
}
