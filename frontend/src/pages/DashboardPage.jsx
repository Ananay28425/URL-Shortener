import React from 'react'
import { Plus } from 'lucide-react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SearchBar from '../components/dashboard/SearchBar'
import StatsGrid from '../components/dashboard/StatsGrid'
import UrlTable from '../components/dashboard/UrlTable'
import { useUrls } from '../hooks/useUrls'

export default function DashboardPage() {
  const { urls, loading, error, remove, refresh } = useUrls()
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return urls
    return urls.filter((u) => {
      const shortId = (u.shortId || '').toLowerCase()
      const shortUrl = (u.shortUrl || '').toLowerCase()
      const url = (u.url || '').toLowerCase()
      return shortId.includes(q) || shortUrl.includes(q) || url.includes(q)
    })
  }, [urls, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-white">
            Analytics Dashboard
          </div>
          <div className="mt-1 text-sm text-white/50">
            Manage links and monitor performance.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            onClick={refresh}
            className="border-white/10 bg-white/[0.04]"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            className="bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              // modal will be reintroduced later; for now route to home create form
              window.location.href = '/'
            }}
          >
            Create New Link
          </Button>
        </div>
      </div>

      <StatsGrid urls={urls} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="text-xs text-white/40">
          {filtered.length} / {urls.length} links
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="inline-flex items-center gap-3 text-white/70">
            <LoadingSpinner />
            Loading links…
          </div>
        </div>
      ) : error ? (
        <EmptyState
          title="Couldn’t load your links"
          description={error?.message || 'Try again in a moment.'}
          action={
            <Button
              variant="primary"
              className="bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
              onClick={refresh}
            >
              Retry
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={urls.length === 0 ? 'No links yet' : 'No results'}
          description={
            urls.length === 0
              ? 'Create your first short link to start collecting analytics.'
              : 'Try a different search query.'
          }
          action={
            <Button
              variant="primary"
              className="bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
              onClick={() => (window.location.href = '/')}
            >
              Create Link
            </Button>
          }
        />
      ) : (
        <UrlTable items={filtered} onDelete={remove} />
      )}
    </div>
  )
}

