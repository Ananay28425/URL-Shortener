import { BarChart3, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import FeatureCard from '../components/FeatureCard'
import HeroSection from '../components/HeroSection'
import StatsCard from '../components/StatsCard'
import UrlForm from '../components/UrlForm'
import { shortenUrl } from '../services/api'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleShorten(payload) {
    setLoading(true)
    const created = await shortenUrl(payload)
    setResult(created)
    setLoading(false)
  }

  return (
    <div>
      <HeroSection />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[1.2fr_.8fr]">
        <UrlForm onSubmit={handleShorten} loading={loading} result={result} />
        <div className="glass-card p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Trusted metrics</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatsCard label="Links Generated" value="12.8M+" hint="Across teams" />
            <StatsCard label="Avg Redirect Time" value="24ms" hint="Global edge" tone="info" />
            <StatsCard label="Uptime" value="99.99%" hint="Enterprise SLA" tone="success" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={Zap} title="Fast Redirects" description="Optimized low-latency redirects distributed across edge infrastructure." />
          <FeatureCard icon={BarChart3} title="Analytics Dashboard" description="Understand traffic patterns with rich trends, peaks, and campaign attribution." />
          <FeatureCard icon={ShieldCheck} title="Secure & Scalable" description="Built for production workloads with secure defaults and resilient architecture." />
        </div>
      </section>
    </div>
  )
}
