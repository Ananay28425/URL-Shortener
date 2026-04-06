import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-20 text-center">
      <div className="glass-card w-full p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-slate">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm text-brand-muted">The page you requested does not exist or has moved.</p>
        <Link to="/" className="btn-secondary mt-5 inline-block">Back to Home</Link>
      </div>
    </div>
  )
}
