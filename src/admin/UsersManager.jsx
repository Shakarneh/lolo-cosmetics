import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { roleNames } from './AdminLayout.jsx'
import DataStatus from '../components/DataStatus.jsx'

const dateFormat = new Intl.DateTimeFormat('ar', { dateStyle: 'medium' })

async function call(action, params = {}) {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action, ...params },
  })
  if (error) {
    let msg = error.message
    try {
      msg = (await error.context.json()).error ?? msg
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg)
  }
  return data
}

function arabicError(err) {
  const m = String(err?.message ?? err)
  if (m.includes('already') || m.includes('registered')) return 'هذا البريد مسجل مسبقاً'
  if (m.includes('password')) return 'كلمة المرور قصيرة — 8 أحرف على الأقل'
  if (m.includes('invalid email') || m.includes('validate email')) return 'البريد الإلكتروني غير صالح'
  if (m.includes('forbidden')) return 'هذه الشاشة للمالك فقط'
  if (m.includes('employee')) return 'يمكن إدارة حسابات الموظفين فقط'
  if (m.includes('Failed to send a request') || m.includes('Failed to fetch'))
    return 'تعذّر الوصول للخادم — تأكد أن وظيفة admin-users منشورة في Supabase'
  return 'حدث خطأ — حاول مجدداً'
}

const inputClass =
  'w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition'
const btnSmall = 'rounded-full px-4 py-1.5 text-xs font-bold transition-colors disabled:opacity-50'

function UsersManager() {
  const { session, profile } = useAuth()
  const [users, setUsers] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  // inline edit: { id, field: 'password' | 'email', value }
  const [edit, setEdit] = useState(null)
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '' })

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const { users: list } = await call('list')
      setUsers(list)
    } catch (err) {
      setLoadError(err)
    }
  }, [])

  useEffect(() => {
    if (profile.role === 'owner') load()
  }, [load, profile.role])

  if (profile.role !== 'owner') {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-3">
        <span className="text-5xl">🔒</span>
        <p className="text-xl font-medium">هذه الشاشة للمالك فقط</p>
      </div>
    )
  }

  if (loadError) return <DataStatus error={loadError} onRetry={load} />
  if (!users) {
    return (
      <div className="py-24 flex justify-center">
        <span className="h-10 w-10 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  async function run(action, params, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setError(null)
    try {
      await call(action, params)
      setEdit(null)
      await load()
    } catch (err) {
      setError(arabicError(err))
    }
    setBusy(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await call('create', {
        email: newUser.email.trim(),
        password: newUser.password,
        full_name: newUser.full_name.trim() || null,
      })
      setNewUser({ email: '', password: '', full_name: '' })
      await load()
    } catch (err) {
      setError(arabicError(err))
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">إدارة المستخدمين</h1>
        <span className="text-taupe">{users.length} حساب</span>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
        <h2 className="font-bold text-rose-dark">إضافة موظف جديد</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="email"
            required
            dir="ltr"
            placeholder="البريد الإلكتروني"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            required
            dir="ltr"
            minLength={8}
            placeholder="كلمة المرور (8+ أحرف)"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="الاسم (اختياري)"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors disabled:opacity-60"
          >
            إنشاء الحساب
          </button>
          <p className="text-xs text-taupe">شارك البريد وكلمة المرور مع الموظف — ويمكنك تغييرهما من هنا لاحقاً.</p>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-white border border-rose/15 divide-y divide-rose/10 overflow-hidden">
        {users.map((u) => {
          const isSelf = u.id === session.user.id
          const isEmployee = u.role === 'employee'
          return (
            <div key={u.id} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium" dir="ltr">
                    {u.email}
                  </p>
                  <p className="text-xs text-taupe mt-0.5">
                    {u.full_name && <>{u.full_name} · </>}
                    أُنشئ {dateFormat.format(new Date(u.created_at))} ·{' '}
                    {u.last_sign_in_at
                      ? `آخر دخول ${dateFormat.format(new Date(u.last_sign_in_at))}`
                      : 'لم يسجل الدخول بعد'}
                  </p>
                </div>
                <span className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-rose-dark">
                  {roleNames[u.role] ?? u.role}
                </span>
                {isSelf && (
                  <span className="rounded-full bg-charcoal/10 px-3 py-1 text-xs font-medium text-charcoal/70">
                    أنت
                  </span>
                )}
                {u.banned && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">محظور</span>
                )}
              </div>

              {isEmployee && (
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    onClick={() => setEdit({ id: u.id, field: 'password', value: '' })}
                    className={`${btnSmall} border border-rose/25 text-rose-dark hover:bg-blush`}
                  >
                    تغيير كلمة المرور
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setEdit({ id: u.id, field: 'email', value: u.email })}
                    className={`${btnSmall} border border-rose/25 text-rose-dark hover:bg-blush`}
                  >
                    تغيير البريد
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      u.banned
                        ? run('unban', { user_id: u.id })
                        : run('ban', { user_id: u.id }, `حظر ${u.email}؟ لن يستطيع الدخول حتى تلغي الحظر.`)
                    }
                    className={`${btnSmall} border border-rose/25 text-rose-dark hover:bg-blush`}
                  >
                    {u.banned ? 'إلغاء الحظر' : 'حظر'}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => run('delete', { user_id: u.id }, `حذف حساب ${u.email} نهائياً؟`)}
                    className={`${btnSmall} ms-auto border border-red-300 text-red-700 hover:bg-red-50`}
                  >
                    حذف
                  </button>
                </div>
              )}

              {edit?.id === u.id && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type={edit.field === 'email' ? 'email' : 'text'}
                    dir="ltr"
                    autoFocus
                    minLength={edit.field === 'password' ? 8 : undefined}
                    placeholder={edit.field === 'password' ? 'كلمة المرور الجديدة (8+ أحرف)' : 'البريد الجديد'}
                    value={edit.value}
                    onChange={(e) => setEdit({ ...edit, value: e.target.value })}
                    className={`${inputClass} max-w-xs`}
                  />
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(edit.field === 'password' ? 'set_password' : 'set_email', {
                        user_id: u.id,
                        [edit.field]: edit.value,
                      })
                    }
                    className={`${btnSmall} bg-rose text-white hover:bg-rose-dark`}
                  >
                    حفظ
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setEdit(null)}
                    className={`${btnSmall} border border-rose/25 text-rose-dark hover:bg-blush`}
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-taupe">
        الحسابات الجديدة تصبح «موظف» تلقائياً. حساب المالك محمي — لا يمكن حظره أو حذفه من هنا نهائياً.
      </p>
    </div>
  )
}

export default UsersManager
