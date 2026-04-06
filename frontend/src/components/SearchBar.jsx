import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search URLs...' }) {
  return (
    <div className="relative w-full max-w-xs">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-dark pl-9"
      />
    </div>
  )
}
