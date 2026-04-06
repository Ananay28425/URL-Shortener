import React from 'react'
import Card from './Card'

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>
      ) : null}
      <div className="text-lg font-semibold text-white">{title}</div>
      {description ? (
        <div className="mt-2 text-sm text-white/60">{description}</div>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  )
}

