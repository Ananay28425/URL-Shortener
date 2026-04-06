import React from 'react'

const VARIANTS = {
  primary:
    'bg-white text-black hover:bg-white/90',
  ghost:
    'bg-transparent hover:bg-white/5 text-white border border-white/10',
  subtle:
    'bg-white/[0.06] hover:bg-white/[0.09] text-white border border-white/10',
  danger:
    'bg-red-500/15 hover:bg-red-500/20 text-red-200 border border-red-500/30',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export default function Button({
  children,
  className = '',
  variant = 'subtle',
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${SIZES[size] || SIZES.md} ${VARIANTS[variant] || VARIANTS.subtle} ${className}`}
      {...props}
    >
      {leftIcon ? <span className="opacity-90">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="opacity-90">{rightIcon}</span> : null}
    </button>
  )
}

