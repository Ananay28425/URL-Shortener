import { Activity, Link2, Menu, MousePointerClick, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import CreateUrlModal from '../components/CreateUrlModal'
import EmptyState from '../components/EmptyState'
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar'
import StatsCard from '../components/StatsCard'
import UrlTable from '../components/UrlTable'
import useUrls from '../hooks/useUrls'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { urls, loading, create, remove, stats } = useUrls()

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return urls.filter((item) => item.shortUrl.toLowerCase().includes(query) || item.url.toLowerCase().includes(query))
  }, [urls, search])

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div>
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">URL Dashboard</h1>
            <p className="text-sm text-brand-muted">Monitor and manage your short links in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="btn-secondary p-2 lg:hidden"><Menu size={15} /></button>
            <SearchBar value={search} onChange={setSearch} />
            <button onClick={() => setModalOpen(true)} className="btn-secondary">Create URL</button>
          </div>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Total URLs" value={stats.total} icon={Link2} />
          <StatsCard label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} tone="info" />
          <StatsCard label="Active Links" value={stats.active} icon={Activity} tone="success" />
          <StatsCard label="Top URL" value={stats.top} icon={Trophy} tone="warning" />
        </section>

        {loading ? (
          <div className="glass-card p-8"><LoadingSpinner label="Loading dashboard data" /></div>
        ) : filtered.length ? (
          <UrlTable items={filtered} onDelete={remove} />
        ) : (
          <EmptyState onAction={() => setModalOpen(true)} />
        )}
      </div>

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
