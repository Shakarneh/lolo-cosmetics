import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { categoryNames } from '../data/categories.js'
import { useAuth } from './AuthContext.jsx'
import DataStatus from '../components/DataStatus.jsx'
import ProductImages from './ProductImages.jsx'
import VariationsEditor from './VariationsEditor.jsx'
import { regenVariants } from '../lib/variations.js'

const emptyForm = {
  code: '',
  name_ar: '',
  brand: '',
  category: 'makeup',
  size: '',
  retail_price: '',
  on_sale: false,
  sale_price: '',
  description: '',
  how_to_use: '',
  featured: false,
  is_published: true,
  variations: null,
}

function toForm(row) {
  return {
    code: row.code ?? '',
    name_ar: row.name_ar ?? '',
    brand: row.brand ?? '',
    category: row.category,
    size: row.size ?? '',
    retail_price: row.retail_price ?? '',
    on_sale: row.on_sale,
    sale_price: row.sale_price ?? '',
    description: row.description ?? '',
    how_to_use: row.how_to_use ?? '',
    featured: row.featured,
    is_published: row.is_published,
    variations: row.variations ?? null,
  }
}

// Clean attributes (trim names + dedupe values), regenerate combinations, coerce prices.
// Returns null when there are no usable attributes/values.
function cleanVariations(v) {
  if (!v) return null
  const attributes = (v.attributes ?? [])
    .map((a) => ({
      name: (a.name ?? '').trim(),
      values: [...new Set((a.values ?? []).map((s) => s.trim()).filter(Boolean))],
    }))
    .filter((a) => a.name && a.values.length > 0)
  if (attributes.length === 0) return null
  const variants = regenVariants(attributes, v.variants ?? []).map((x) => ({
    key: x.key,
    values: x.values,
    price: x.price === '' || x.price == null ? null : Number(x.price),
    code: (x.code ?? '').trim(),
  }))
  if (variants.length === 0) return null
  return { attributes, variants }
}

function dbErrorMessage(error) {
  if (error.code === '23505') return 'هذا الكود مستخدم لمنتج آخر — غيّر كود المنتج'
  if (error.code === '23514') return 'سعر العرض يجب أن يكون أقل من السعر الأساسي'
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

function ProductForm() {
  const { id } = useParams() // undefined on /admin/products/new
  const isNew = !id
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [form, setForm] = useState(isNew ? emptyForm : null)
  const [loadError, setLoadError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // suggest the next free LC#### code for brand-new products (owner can change it)
  useEffect(() => {
    if (!isNew) return
    supabase
      .from('products')
      .select('code')
      .like('code', 'LC%')
      .then(({ data }) => {
        const max = (data ?? [])
          .map((r) => Number(r.code.slice(2)))
          .filter(Number.isFinite)
          .reduce((a, b) => Math.max(a, b), 1000)
        setForm((f) => (f && f.code === '' ? { ...f, code: `LC${max + 1}` } : f))
      })
  }, [isNew])

  useEffect(() => {
    if (isNew) return
    let active = true
    supabase
      .from('products')
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
        <p className="text-xl font-medium">المنتج غير موجود</p>
        <Link to="/admin/products" className="text-rose-dark underline">
          العودة لقائمة المنتجات
        </Link>
      </div>
    )
  }

  if (loadError) return <DataStatus error={loadError} onRetry={() => window.location.reload()} />

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
    if (!form.name_ar.trim()) return 'اسم المنتج مطلوب'
    if (!form.code.trim()) return 'كود المنتج مطلوب'
    // when the product has variations, per-variation prices replace the base price
    if (form.variations != null) {
      for (const r of form.variations.variants ?? []) {
        if (r.price !== '' && r.price != null) {
          const p = Number(r.price)
          if (!Number.isFinite(p) || p < 0) return 'سعر أحد الخيارات غير صالح'
        }
      }
      return null
    }
    const retail = form.retail_price === '' ? null : Number(form.retail_price)
    const sale = form.sale_price === '' ? null : Number(form.sale_price)
    if (retail != null && (!Number.isFinite(retail) || retail < 0)) return 'السعر الأساسي غير صالح'
    if (form.on_sale) {
      if (retail == null) return 'ضع السعر الأساسي أولاً قبل تفعيل العرض'
      if (sale == null || !Number.isFinite(sale) || sale < 0) return 'ضع سعر العرض'
      if (sale >= retail) return 'سعر العرض يجب أن يكون أقل من السعر الأساسي'
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
    const variations = cleanVariations(form.variations)
    const hasVar = variations != null
    const payload = {
      code: form.code.trim(),
      name_ar: form.name_ar.trim(),
      brand: form.brand.trim() || null,
      category: form.category,
      size: form.size.trim() || null,
      // per-variation prices replace the base price/sale when the product has variations
      retail_price: hasVar ? null : form.retail_price === '' ? null : Number(form.retail_price),
      on_sale: hasVar ? false : form.on_sale,
      sale_price: !hasVar && form.on_sale && form.sale_price !== '' ? Number(form.sale_price) : null,
      description: form.description,
      how_to_use: form.how_to_use,
      featured: form.featured,
      is_published: form.is_published,
      variations,
    }
    setSaving(true)
    setError(null)
    const newId = payload.code.toLowerCase()
    const result = isNew
      ? await supabase.from('products').insert({ id: newId, ...payload })
      : await supabase.from('products').update(payload).eq('id', id)
    setSaving(false)
    if (result.error) {
      setError(dbErrorMessage(result.error))
      return
    }
    // new product → go to its edit page so photos can be added right away
    navigate(isNew ? `/admin/products/${newId}` : '/admin/products')
  }

  async function handleDelete() {
    if (!window.confirm(`سيتم حذف «${form.name_ar}» نهائياً ولا يمكن التراجع — هل أنت متأكد؟`)) return
    setDeleting(true)
    setError(null)
    const { data, error: delError } = await supabase.from('products').delete().eq('id', id).select('id')
    setDeleting(false)
    if (delError) {
      setError(dbErrorMessage(delError))
      return
    }
    if (!data || data.length === 0) {
      setError('لا تملك صلاحية حذف المنتجات')
      return
    }
    navigate('/admin/products')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">
          {isNew ? 'إضافة منتج جديد' : 'تعديل منتج'}
        </h1>
        <Link to="/admin/products" className="text-sm text-taupe hover:text-rose-dark transition-colors">
          → العودة للقائمة
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-5">
        <Field label="اسم المنتج *">
          <input type="text" required value={form.name_ar} onChange={set('name_ar')} className={inputClass} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="الماركة">
            <input type="text" value={form.brand} onChange={set('brand')} className={inputClass} />
          </Field>
          <Field label="الحجم (مثال: 100 مل)">
            <input type="text" value={form.size} onChange={set('size')} className={inputClass} />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="القسم *">
            <select value={form.category} onChange={set('category')} className={inputClass}>
              {Object.entries(categoryNames).map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="كود المنتج *">
            <input type="text" required dir="ltr" value={form.code} onChange={set('code')} className={inputClass} />
          </Field>
        </div>

        {form.variations == null && (
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <Field label="السعر الأساسي (₪)">
              <input
                type="number"
                min="0"
                step="0.5"
                dir="ltr"
                value={form.retail_price}
                onChange={set('retail_price')}
                placeholder="اتركه فارغاً لعرض «تواصل معنا للسعر»"
                className={inputClass}
              />
            </Field>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" checked={form.on_sale} onChange={set('on_sale')} className="w-4 h-4 accent-rose" />
                <span className="text-sm font-medium">المنتج عليه عرض / خصم</span>
              </label>
              {form.on_sale && (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  dir="ltr"
                  value={form.sale_price}
                  onChange={set('sale_price')}
                  placeholder="سعر العرض (₪)"
                  className={inputClass}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-rose/10 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.variations != null}
              onChange={(e) =>
                setForm({ ...form, variations: e.target.checked ? { attributes: [], variants: [] } : null })
              }
              className="w-4 h-4 accent-rose"
            />
            <span className="text-sm font-medium">هذا المنتج له عدة خيارات (تنويعات)</span>
          </label>
          {form.variations != null && (
            <>
              <p className="text-xs text-taupe">
                عند تفعيل التنويعات يُحدَّد السعر لكل خيار بالأسفل، ويحلّ محل السعر الأساسي.
              </p>
              <VariationsEditor
                value={form.variations}
                onChange={(v) => setForm({ ...form, variations: v })}
              />
            </>
          )}
        </div>

        <Field label="الوصف">
          <textarea rows={4} value={form.description} onChange={set('description')} className={inputClass} />
        </Field>

        <Field label="طريقة الاستخدام">
          <textarea rows={4} value={form.how_to_use} onChange={set('how_to_use')} className={inputClass} />
        </Field>

        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={set('is_published')}
              className="w-4 h-4 accent-rose"
            />
            <span className="text-sm font-medium">ظاهر في الموقع</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} className="w-4 h-4 accent-rose" />
            <span className="text-sm font-medium">منتج مميز</span>
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose/10">
          <button
            type="submit"
            disabled={saving || deleting}
            className="rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <Link to="/admin/products" className="rounded-full border border-rose/25 px-6 py-2.5 text-sm text-rose-dark hover:bg-blush transition-colors">
            إلغاء
          </Link>
          {!isNew && profile.role === 'owner' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="ms-auto rounded-full border border-red-300 px-6 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {deleting ? 'جاري الحذف...' : 'حذف المنتج'}
            </button>
          )}
        </div>
      </form>

      {isNew ? (
        <p className="text-sm text-taupe text-center">ستتمكن من إضافة الصور بعد حفظ المنتج.</p>
      ) : (
        <ProductImages productId={id} />
      )}
    </div>
  )
}

export default ProductForm
