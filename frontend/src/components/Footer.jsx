export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-brand-slate sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} url.forge — Analytics-Driven URL Platform</p>
        <p>Built for speed, security, and insight.</p>
      </div>
    </footer>
  )
}
