import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StatsCard from '../components/StatsCard'
import UrlTable from '../components/UrlTable'
import CreateUrlModal from '../components/CreateUrlModal'
import EmptyState from '../components/EmptyState'
import { StatsSkeleton, TableSkeleton } from '../components/Skeletons'
import { getAllUrls, deleteUrl } from '../services/api'
import { motion } from 'framer-motion'

export default function Dashboard(){
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const data = await getAllUrls()
        if(mounted) setUrls(data)
      }catch(err){ console.error(err) }
      setLoading(false)
    }
    load()
    return ()=> mounted = false
  },[])

  async function handleDelete(id){
    await deleteUrl(id)
    setUrls(s=>s.filter(x=>x.shortId !== id))
  }

  return (
    <div className="pt-6">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[18rem_1fr] gap-6">
        <Sidebar />
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <p className="text-slate-300">Manage short links and track performance.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setModalOpen(true)} className="px-4 py-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 font-semibold">Create New URL</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {loading ? <StatsSkeleton /> : (
              <>
                <StatsCard label="Total URLs" value={urls.length} />
                <StatsCard label="Total Clicks" value={urls.reduce((s,a)=>s+(a.clicks||0),0)} />
                <StatsCard label="Active Links" value={urls.filter(u=>u.status==='active').length} />
                <StatsCard label="Top Performing" value={urls[0]?.shortId || '—'} />
              </>
            )}
          </div>

          <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay:0.05}}>
            {loading ? <TableSkeleton rows={6} /> : (
              urls.length === 0 ? <EmptyState onCreate={()=>setModalOpen(true)} /> : <UrlTable items={urls} onDelete={handleDelete} />
            )}
          </motion.div>
        </div>
      </div>

      <CreateUrlModal open={modalOpen} onClose={()=>setModalOpen(false)} onCreated={(item)=>setUrls(s=>[item, ...s])} />
    </div>
  )
}
