import React from 'react'

export default function Card({ children, className = '', as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

