import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export const roleNames = { owner: 'مالك', partner: 'شريك', employee: 'موظف' }

const tabClass = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? 'bg-rose text-white font-bold' : 'text-taupe hover:bg-blush'
  }`

function AdminLayout() {
  const { session, profile, checking, signOut } = useAuth()

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-10 w-10 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  // signed in but no profile row → this account has no admin access
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔒</span>
        <p className="text-xl font-medium">هذا الحساب لا يملك صلاحية الدخول للوحة التحكم</p>
        <button
          onClick={signOut}
          className="rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-rose/15">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="لولو" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-bold text-rose-dark">لوحة التحكم</span>
            <span className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-rose-dark">
              {roleNames[profile.role] ?? profile.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-taupe hover:text-rose-dark transition-colors">
              عرض الموقع
            </Link>
            <button
              onClick={signOut}
              className="rounded-full border border-rose/25 px-4 py-1.5 text-sm text-rose-dark hover:bg-blush transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-4 flex gap-1 pb-2">
          <NavLink to="/admin" end className={tabClass}>
            الرئيسية
          </NavLink>
          <NavLink to="/admin/products" className={tabClass}>
            المنتجات
          </NavLink>
          <NavLink to="/admin/reviews" className={tabClass}>
            التقييمات
          </NavLink>
          {profile.role === 'owner' && (
            <NavLink to="/admin/users" className={tabClass}>
              المستخدمين
            </NavLink>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
