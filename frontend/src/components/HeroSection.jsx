import React from 'react'
import UrlForm from './UrlForm'
import FeatureCard from './FeatureCard'

export default function HeroSection(){
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-300">Shorten • Track • Scale</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white leading-tight">Shorten Links. Track Everything. Scale Beautifully.</h1>
          <p className="mt-4 text-slate-300 max-w-xl">Generate clean short links, monitor click analytics, and manage URL performance with a premium, production-style dashboard.</p>

          <div className="mt-8">
            <UrlForm />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard icon="zap" title="Fast Redirects" desc="Ultra low-latency redirects with global edge support." />
            <FeatureCard icon="bar" title="Real-Time Analytics" desc="Live insights and historical trends for every link." />
            <FeatureCard icon="shield" title="Secure & Scalable" desc="Rate-limits, custom aliases, and enterprise-grade security." />
          </div>
        </div>

        <div className="relative">
          <div className="card p-8 shadow-xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))'}}>
            <div className="text-slate-300">Live Preview</div>
            <div className="mt-4">
              <div className="w-full h-56 rounded-xl bg-gradient-to-br from-white/3 to-white/2 border border-white/6 flex items-center justify-center">
                <div className="text-center text-slate-300">Analytics snapshot and trend visual here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
