import React from 'react'
import HeroSection from '../components/HeroSection'

export default function Home(){
  return (
    <div className="pt-6">
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <h3 className="text-white text-2xl font-bold">Built for scale, designed for clarity</h3>
          <p className="mt-2 text-slate-300">A premium developer-first URL shortening platform with built-in analytics and enterprise features.</p>
          <div className="mt-6">
            <a href="/dashboard" className="px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black font-semibold">Get Started</a>
          </div>
        </div>
      </section>
    </div>
  )
}
