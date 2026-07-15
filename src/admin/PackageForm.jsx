import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import DataStatus from '../components/DataStatus.jsx'
import PackageImages from './PackageImages.jsx'
import PackageItems from './PackageItems.jsx'

const emptyForm = {
  name_ar: '',
  description: '',
  price: '',
  is_published: true,
  featured: false,
}

function toForm(row) {
  return {
    name_ar: row.name_ar ?? '',
    description: row.description ?? '',
    price: row.price ?? '',
    is_published: row.is_published,
    featured: row.featured,
  }
}

function dbErrorMessage(error) {
  if (error.code === '23514') return 'السعر يجب أن يكون رقماً موجباً'
  if (error.code === '42501') return 'لا تملك صلاحية لهذا الإجراء'
  return 'حدث خطأ أثناء الحفظ — حاول مجدداً'
}

const inputClass =
  'w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function PackageForm() {
  const { id } = useParams() // undefined on /admin/packages/new
  const isNew = !id
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [form, setForm] = useState(isNew ? emptyForm : null)
  const [loadError, setLoadError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isNew) return
    let active = true
    supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: dbError }) => {
        if (!active) return
        if (dbError) setLoadError(dbError)
        else if (!data) setNotFound(true)
        else setForm(toForm(data))
      })
    return () => {
      active = false
    }
  }, [id, isNew])

  if (notFound) {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-4">
        <p className="text-xl font-medium">البكج غير موجود</p>
        <Link to="/admin/packages" className="text-rose-dark underline">
          العودة لقائمة البكجات
        </Link>
      </div>
    )
  }

  if (loadError) return <DataStatus error={loadError} onRetry={() => window.location.reload()} label="البكجات" />

  if (!form) {
    return (
      <div className="py-24 flex justify-center">
        <span className="h-10 w-10 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function validate() {
    if (!form.name_ar.trim()) return 'اسم البكج مطلوب'
    if (form.price !== '') {
      const price = Number(form.price)
      if (!Number.isFinite(price) || price < 0) return 'سعر البكج غير صالح'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const invalid = validate()
    if (invalid) {
      setError(invalid)
      return
    }
    const payload = {
      name_ar: form.name_ar.trim(),
      description: form.description,
      price: form.price === '' ? null : Number(form.price),
      is_published: form.is_published,
      featured: form.featured,
    }
    setSaving(true)
    setError(null)
    const result = isNew
      ? await supabase.from('packages').insert(payload).select('id').single()
      : await supabase.from('packages').update(payload).eq('id', id)
    setSaving(false)
    if (result.error) {
      setError(dbErrorMessage(result.error))
      return
    }
    // new package → go to its edit page so products + photos can be added right away
    navigate(isNew ? `/admin/packages/${result.data.id}` : '/admin/packages')
  }

  async function handleDelete() {
    if (!window.confirm(`سيتم حذف بكج «${form.name_ar}» نهائياً ولا يمكن التراجع — هل أنت متأكد؟`)) return
    setDeleting(true)
    setError(null)
    const { data, error: delError } = await supabase.from('packages').delete().eq('id', id).select('id')
    setDeleting(false)
    if (delError) {
      setError(dbErrorMessage(delError))
      return
    }
    if (!data || data.length === 0) {
      setError('لا تملك صلاحية حذف البكجات')
      return
    }
    navigate('/admin/packages')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">
          {isNew ? 'إضافة بكج جديد' : 'تعديل بكج'}
        </h1>
        <Link to="/admin/packages" className="text-sm text-taupe hover:text-rose-dark transition-colors">
          → العودة للقائمة
        </Link>
      </div>

      <form
        id="package-form"
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-5"
      >
        <Field label="اسم البكج *">
          <input type="text" required value={form.name_ar} onChange={set('name_ar')} className={inputClass} />
        </Field>

        <Field label="سعر البكج (₪)">
          <input
            type="number"
            min="0"
            step="0.5"
            dir="ltr"
            value={form.price}
            onChange={set('price')}
            placeholder="اتركه فارغاً لعرض «تواصل معنا للسعر»"
            className={inputClass}
          />
        </Field>

        <Field label="الوصف">
          <textarea rows={4} value={form.description} onChange={set('description')} className={inputClass} />
        </Field>

        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={set('is_published')}
              className="w-4 h-4 accent-rose"
            />
            <span className="text-sm font-medium">ظاهرة في الموقع</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} className="w-4 h-4 accent-rose" />
            <span className="text-sm font-medium">بكج مميز</span>
          </label>
        </div>
      </form>

      {isNew ? (
        <p className="text-sm text-taupe text-center">ستتمكن من اختيار المنتجات وإضافة الصور بعد حفظ البكج.</p>
      ) : (
        <>
          <PackageItems packageId={id} />
          <PackageImages packageId={id} />
        </>
      )}

      {/* actions live at the BOTTOM of the page, under the item/media sections (same pattern as ProductForm) */}
      <div className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            form="package-form"
            disabled={saving || deleting}
            className="rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <Link to="/admin/packages" className="rounded-full border border-rose/25 px-6 py-2.5 text-sm text-rose-dark hover:bg-blush transition-colors">
            إلغاء
          </Link>
          {!isNew && profile.role === 'owner' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="ms-auto rounded-full border border-red-300 px-6 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {deleting ? 'جاري الحذف...' : 'حذف البكج'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PackageForm
