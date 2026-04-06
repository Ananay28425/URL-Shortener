import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="mt-12 border-t border-white/6 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-300">© {new Date().getFullYear()} URL Shortener — Scalable & Analytics-Driven</div>
        <div className="flex gap-4">
          <Link to="/" className="text-slate-300 hover:text-white">Home</Link>
          <Link to="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
          <a href="/" className="text-slate-300 hover:text-white">Docs</a>
        </div>
      </div>
    </footer>
  )
}
