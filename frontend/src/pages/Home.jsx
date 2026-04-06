import { BarChart3, ShieldCheck, Zap, Sparkles, TrendingUp, Lock } from 'lucide-react'
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

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 lg:p-10">
          <div className="mb-6 inline-block rounded-full bg-brand-indigo/20 px-3 py-1 text-xs font-semibold text-brand-indigo">
            Get Started
          </div>
          <h2 className="text-3xl font-bold text-brand-text">Create Your First Link</h2>
          <p className="mt-3 text-brand-muted">Enter a URL and get a shareable link instantly. No signup required.</p>
          <UrlForm onSubmit={handleShorten} loading={loading} result={result} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-brand-slate">Features</p>
          <h2 className="text-4xl font-bold text-brand-text">Everything You Need to Succeed</h2>
          <p className="mt-4 max-w-2xl mx-auto text-brand-muted">Powerful tools built for modern teams and growing businesses.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={Zap} 
            title="Lightning Fast" 
            description="Redirect in milliseconds with our globally distributed edge network. Optimized for speed."
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Real-time Analytics" 
            description="Track clicks, geographic distribution, and trends with rich dashboards and insights."
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Enterprise Security" 
            description="Built-in security with HTTPS, rate limiting, and audit logs for compliance."
          />
          <FeatureCard 
            icon={Sparkles} 
            title="Easy Integration" 
            description="REST API for seamless integration into your applications and workflows."
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Campaign Tracking" 
            description="Tag links and monitor performance across different campaigns and channels."
          />
          <FeatureCard 
            icon={Lock} 
            title="Private & Reliable" 
            description="Your data stays secure. Self-hosted or cloud options for complete control."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-brand-slate">Trusted By</p>
          <h2 className="text-3xl font-bold text-brand-text">Teams Everywhere Trust Us</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="leading-relaxed text-brand-muted">
              &quot;We shortened 10 million links last year. The speed and reliability is unmatched.&quot;
            </p>
            <p className="mt-4 font-semibold text-brand-text">Sarah Chen</p>
            <p className="text-xs text-brand-slate">Product Lead, TechCorp</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="leading-relaxed text-brand-muted">
              &quot;The analytics dashboard gives us insights we never had before. Game-changer for our marketing.&quot;
            </p>
            <p className="mt-4 font-semibold text-brand-text">Marcus Johnson</p>
            <p className="text-xs text-brand-slate">Marketing Director, Growth Inc</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="leading-relaxed text-brand-muted">
              &quot;API integration was smooth. We had it running in production within hours.&quot;
            </p>
            <p className="mt-4 font-semibold text-brand-text">Alex Rivera</p>
            <p className="text-xs text-brand-slate">Engineering Manager, StartupXYZ</p>
          </div>
        </div>
      </section>
    </div>
  )
}
