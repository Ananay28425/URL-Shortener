import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card p-8 text-center">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-2 text-slate-300">We couldn't find that page.</p>
        <div className="mt-4"><Link to="/" className="px-4 py-2 rounded-md bg-white/6">Go home</Link></div>
      </div>
    </div>
  )
}
