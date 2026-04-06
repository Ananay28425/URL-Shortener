import React from 'react'

export default function LoadingSpinner({ size = 28 }){
  return (
    <div style={{width:size, height:size}} className="rounded-full border-2 border-t-transparent border-white/30 animate-spin"></div>
  )
}
