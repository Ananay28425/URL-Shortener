export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-brand-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-brand-cyan" />
      <span>{label}</span>
    </div>
  )
}
