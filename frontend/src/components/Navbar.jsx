import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Create' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/login', label: 'Login' }
]

export default function Navbar() {
  return (
    <header className="border-b border-[#333333] bg-[#050505]">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-sm font-bold uppercase tracking-wide text-brand-text">URL SHORTENER</Link>
        <nav className="flex items-center gap-2">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-md border px-3 py-1 text-xs uppercase tracking-wide ${isActive ? 'border-brand-indigo text-brand-indigo' : 'border-[#333333] text-brand-muted hover:text-brand-text'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
