import GradientButton from '../components/GradientButton'

export default function Login() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl place-items-center px-4 py-4">
      <div className="w-full max-w-md rounded-md border border-[#333333] bg-[#050505] p-4">
        <p className="text-xs uppercase tracking-wide text-brand-slate">Auth Console</p>
        <h1 className="mt-1 text-lg font-bold">Operator Login</h1>
        <form className="mt-4 grid gap-3">
          <input className="input-dark" type="email" placeholder="operator@domain.com" />
          <input className="input-dark" type="password" placeholder="••••••••" />
          <GradientButton type="submit" className="mt-1 w-full">Sign In</GradientButton>
        </form>
      </div>
    </div>
  )
}
