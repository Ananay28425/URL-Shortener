import React from 'react'

export default function LoadingSpinner({ size = 18, className = '' }) {
  return (
    <div
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-white/70 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

