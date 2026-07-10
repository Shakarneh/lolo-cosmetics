import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

function Login() {
  const { session, checking, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-10 w-10 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: authError } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (authError) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-rose/15 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-20 h-20 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-rose-dark">لوحة التحكم</h1>
          <p className="text-sm text-taupe">تسجيل الدخول لإدارة المتجر</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">البريد الإلكتروني</span>
            <input
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-rose/20 bg-cream/50 px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">كلمة المرور</span>
            <input
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-rose/20 bg-cream/50 px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-rose px-6 py-3 text-white font-bold hover:bg-rose-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
