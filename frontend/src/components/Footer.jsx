export default function Footer() {
  return (
    <footer className="mt-12 border-t border-red-500/45">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-xs uppercase tracking-wide text-white/75 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} URL Shortener</p>
        <p className="text-red-300">Scalable • Analytics-Driven</p>
      </div>
    </footer>
  )
}
