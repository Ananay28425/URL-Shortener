import React from 'react'
import { PlusSquare } from 'lucide-react'

export default function EmptyState({ title = 'No short URLs created yet.', desc = 'Create your first short link to get started.' , onCreate}){
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-white/6 flex items-center justify-center">
        <PlusSquare size={28} />
      </div>
      <h3 className="mt-4 text-xl text-white font-semibold">{title}</h3>
      <p className="mt-2 text-slate-300">{desc}</p>
      {onCreate && <div className="mt-4"><button onClick={onCreate} className="px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black font-semibold">Create URL</button></div>}
    </div>
  )
}
