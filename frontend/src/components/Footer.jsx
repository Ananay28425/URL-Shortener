export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-cyan flex items-center justify-center">
                <span className="text-sm font-bold text-white">uF</span>
              </div>
              <span className="font-bold text-brand-text">url.forge</span>
            </div>
            <p className="text-sm text-brand-slate">URL shortening and analytics at scale.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Product</p>
            <ul className="space-y-2 text-sm text-brand-slate">
              <li><a href="#" className="hover:text-brand-text transition">Features</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-text transition">API Docs</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Company</p>
            <ul className="space-y-2 text-sm text-brand-slate">
              <li><a href="#" className="hover:text-brand-text transition">About</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Blog</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Legal</p>
            <ul className="space-y-2 text-sm text-brand-slate">
              <li><a href="#" className="hover:text-brand-text transition">Privacy</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Terms</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col gap-2 text-xs text-brand-slate sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} url.forge — All rights reserved.</p>
          <p>Built for speed, scale, and insight.</p>
        </div>
      </div>
    </footer>
  )
}
