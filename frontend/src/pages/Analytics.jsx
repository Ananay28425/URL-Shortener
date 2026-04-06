import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAnalytics } from '../services/api'
import AnalyticsChart from '../components/AnalyticsChart'
import TopUrlsChart from '../components/TopUrlsChart'
import { ChartSkeleton } from '../components/Skeletons'
import formatDate from '../utils/formatDate'

export default function Analytics(){
  const { shortId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const res = await getAnalytics(shortId)
        if(mounted) setData(res)
      }catch(err){ console.error(err) }
      setLoading(false)
    }
    load()
    return ()=> mounted = false
  },[shortId])

  if(loading) return (
    <div className="pt-6">
      <div className="max-w-7xl mx-auto px-4 grid gap-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div className="space-y-4">
            <div className="card p-4 animate-pulse"><div className="h-4 bg-white/6 w-1/3 mb-3"></div><div className="h-12 bg-white/6 rounded"/></div>
            <div className="card p-4 animate-pulse"><div className="h-4 bg-white/6 w-1/3 mb-3"></div><div className="h-24 bg-white/6 rounded"/></div>
          </div>
        </div>
        <div className="card p-4 animate-pulse"><div className="h-4 bg-white/6 w-1/3 mb-3"></div><div className="h-40 bg-white/6 rounded"/></div>
      </div>
    </div>
  )

  if(!data) return <div className="p-8 card">No analytics found.</div>

  return (
    <div className="pt-6">
      <div className="max-w-7xl mx-auto px-4 grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-300">Short URL</div>
            <div className="text-white font-mono text-lg">{data.shortId ? `${window.location.origin}/${data.shortId}` : data.url}</div>
            <div className="text-slate-400">Created {formatDate(data.created_at)} • {data.total_clicks} total clicks</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnalyticsChart data={data.trend || []} />
          </div>
          <div className="space-y-4">
            <div className="card p-4">
              <div className="text-slate-300 text-sm">Total Clicks</div>
              <div className="text-2xl text-white font-bold">{data.total_clicks}</div>
            </div>
            <div className="card p-4">
              <div className="text-slate-300 text-sm">Top Countries</div>
              <ul className="mt-2 text-white">
                {(data.top_countries||[]).map(c=> <li key={c.country} className="flex justify-between"><span>{c.country}</span><span className="text-slate-300">{c.clicks}</span></li>)}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <TopUrlsChart data={(data.top_referrers||[]).map((r, idx)=> ({ shortId: r.ref, clicks: r.clicks }))} />
        </div>
      </div>
    </div>
  )
}
