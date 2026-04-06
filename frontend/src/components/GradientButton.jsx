import React from 'react'

export default function GradientButton({ children, className = '', ...props }){
  return (
    <button {...props} className={`px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black font-semibold ${className}`}>{children}</button>
  )
}
