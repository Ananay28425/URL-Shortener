import React from 'react'
import HeroSection from '../components/home/HeroSection'
import UrlShortenerForm from '../components/home/UrlShortenerForm'
import LogConsole from '../components/home/LogConsole'
import FeatureCards from '../components/home/FeatureCards'

export default function HomePage() {
  return (
    <div className="space-y-10">
      <HeroSection />

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <UrlShortenerForm />
        <LogConsole />
      </section>

      <FeatureCards />
    </div>
  )
}

