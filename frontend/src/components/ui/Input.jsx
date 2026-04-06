import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 ${className}`}
      {...props}
    />
  )
}

