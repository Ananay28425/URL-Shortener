import React from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search links...' }){
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-black/20 border border-white/6">
      <Search size={16} className="text-slate-300" />
      <input value={value} onChange={e=>onChange && onChange(e.target.value)} placeholder={placeholder} className="bg-transparent flex-1 outline-none text-white" />
    </div>
  )
}
