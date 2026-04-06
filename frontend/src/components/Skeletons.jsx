import React from 'react'

export function StatsSkeleton(){
  return (
    <>
      {Array.from({length:4}).map((_,i)=> (
        <div key={i} className="card p-4 animate-pulse">
          <div className="h-4 bg-white/6 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-white/6 rounded w-1/2"></div>
        </div>
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5 }){
  return (
    <div className="card p-4">
      <div className="h-4 bg-white/6 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="space-y-3">
        {Array.from({length: rows}).map((_,i)=> (
          <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
            <div className="h-6 bg-white/6 rounded w-40"></div>
            <div className="h-6 bg-white/6 rounded w-80"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton(){
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-4 bg-white/6 rounded w-1/3 mb-3"></div>
      <div className="w-full h-56 rounded bg-white/6"></div>
    </div>
  )
}
