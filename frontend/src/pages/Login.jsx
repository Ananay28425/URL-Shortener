import GradientButton from '../components/GradientButton'

export default function Login() {
  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_45%)]" />
      <div className="glass-card relative z-10 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-brand-muted">Sign in to access your link analytics dashboard.</p>
        <form className="mt-6 grid gap-3">
          <input className="input-dark" type="email" placeholder="Email address" />
          <input className="input-dark" type="password" placeholder="Password" />
          <GradientButton type="submit" className="mt-1">Log in</GradientButton>
        </form>
      </div>
    </div>
  )
}
