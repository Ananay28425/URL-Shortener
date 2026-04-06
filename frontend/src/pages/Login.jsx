import React, { useState } from 'react'

export default function Login(){
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h2 className="text-2xl text-white font-bold">Sign in</h2>
          <p className="text-slate-300">Enter your credentials to continue.</p>
          <form className="mt-6 grid gap-3">
            <label className="text-slate-300 text-sm">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="p-3 rounded-lg bg-black/30 border border-white/6 text-white" />
            <label className="text-slate-300 text-sm">Password</label>
            <input value={pass} onChange={e=>setPass(e.target.value)} type="password" className="p-3 rounded-lg bg-black/30 border border-white/6 text-white" />
            <div className="flex items-center justify-between mt-2">
              <label className="text-slate-300 text-sm"><input type="checkbox" className="mr-2"/> Remember me</label>
              <a className="text-slate-300 text-sm">Forgot?</a>
            </div>
            <button className="mt-4 px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black font-semibold">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  )
}
