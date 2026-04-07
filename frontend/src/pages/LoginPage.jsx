import React from 'react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <div className="text-2xl font-semibold text-white">Sign in</div>
          <div className="mt-2 text-sm text-white/55">
            Continue to your analytics dashboard.
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              // auth will be implemented later; this page is UI-only for now
              window.location.href = '/dashboard'
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Password
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/60">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-white/20 bg-transparent"
                />
                Remember me
              </label>
              <a href="#" className="text-white/60 hover:text-white">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[var(--accent)] text-black hover:bg-[color:var(--accent)]/90"
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

