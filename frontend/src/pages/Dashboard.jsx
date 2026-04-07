import { Activity, BarChart3, Link2, MousePointerClick, Plus, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import CreateUrlModal from '../components/CreateUrlModal'
import EmptyState from '../components/EmptyState'
import SearchBar from '../components/SearchBar'
import StatsCard from '../components/StatsCard'
import UrlTable from '../components/UrlTable'
import useUrls from '../hooks/useUrls'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const { urls, loading, create, remove, stats } = useUrls()

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return urls.filter((item) => item.shortUrl.toLowerCase().includes(query) || item.url.toLowerCase().includes(query))
  }, [urls, search])

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#333333] bg-[#050505] p-3">
        <div>
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          <p className="text-xs text-brand-slate">manage links • inspect traffic • maintain uptime</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar value={search} onChange={setSearch} />
          <button onClick={() => setModalOpen(true)} className="btn-secondary flex items-center gap-2"><Plus size={14} />Create</button>
        </div>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Links" value={stats.total} icon={Link2} />
        <StatsCard label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} />
        <StatsCard label="Active Links" value={stats.active} icon={Activity} />
        <StatsCard label="Top Link" value={stats.top} icon={Trophy} />
      </section>

      {loading ? (
        <div className="glass-card p-6"><LoadingSpinner label="Loading dashboard data" /></div>
      ) : filtered.length ? (
        <UrlTable items={filtered} onDelete={remove} />
      ) : (
        <EmptyState onAction={() => setModalOpen(true)} />
      )}

      <CreateUrlModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (payload) => {
          const created = await create(payload)
          return created
        }}
      />
    </div>
  )
}
