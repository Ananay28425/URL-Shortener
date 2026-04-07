import React from 'react'
import { Search } from 'lucide-react'
import Input from '../ui/Input'

export default function SearchBar({ value, onChange, placeholder = 'Search links…' }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <Search size={16} className="text-white/40" />
      <Input
        className="border-0 bg-transparent px-0 py-0 focus:ring-0"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

