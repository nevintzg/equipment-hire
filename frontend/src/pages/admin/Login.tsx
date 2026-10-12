import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DEMO_ADMIN, useStore } from '../../store/AppStore'
import { Field, Logo } from '../../components/ui'

export default function Login() {
  const { admin, login } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (admin) return <Navigate to={from} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (login(email, password)) navigate(from, { replace: true })
    else setError('Email or password is incorrect.')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-navy-50 to-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="card space-y-5 p-8">
          <h1 className="text-center text-xl font-bold">CRN SA Staff Login</h1>
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <Field label="Email address" htmlFor="email">
            <input id="email" type="email" className="input" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <button className="btn-primary w-full">Log in</button>
          <p className="text-center text-xs text-slate-500">Forgot your password? Ask the CRN SA office manager to reset it.</p>
        </form>

        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-600">
          Demo login: <span className="font-mono">{DEMO_ADMIN.email}</span> / <span className="font-mono">{DEMO_ADMIN.password}</span>
          <button
            type="button"
            className="ml-2 font-semibold text-navy-600 hover:underline"
            onClick={() => {
              setEmail(DEMO_ADMIN.email)
              setPassword(DEMO_ADMIN.password)
            }}
          >
            Fill in
          </button>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to public site
        </Link>
      </div>
    </div>
  )
}
