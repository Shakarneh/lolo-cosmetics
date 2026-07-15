import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAdminProducts } from './useAdminProducts.js'

// Lets staff build a package by searching products by code or name and adding them,
// with a quantity per included product. Backed directly by the package_items table
// (no local draft state) so changes save immediately, same as ProductImages.
function PackageItems({ packageId }) {
  const { products } = useAdminProducts()
  const [items, setItems] = useState(null) // null = loading
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from('package_items')
      .select('*')
      .eq('package_id', packageId)
      .order('position')
    if (dbError) setError('تعذّر تحميل منتجات البكج')
    else setItems(data)
  }, [packageId])

  useEffect(() => {
    load()
  }, [load])

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !items) return []
    const already = new Set(items.map((i) => i.product_id))
    return products
      .filter((p) => !already.has(p.id) && (p.code.toLowerCase().includes(q) || p.name_ar.toLowerCase().includes(q)))
      .slice(0, 6)
  }, [products, query, items])

  async function addProduct(p) {
    setBusy(true)
    setError(null)
    const position = items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0
    const { error: insError } = await supabase
      .from('package_items')
      .insert({ package_id: packageId, product_id: p.id, quantity: 1, position })
    if (insError) setError('تعذّر إضافة المنتج للبكج')
    setQuery('')
    await load()
    setBusy(false)
  }

  async function updateQuantity(item, quantity) {
    if (!Number.isFinite(quantity) || quantity < 1) return
    setBusy(true)
    const { error: updError } = await supabase
      .from('package_items')
      .update({ quantity })
      .eq('package_id', packageId)
      .eq('product_id', item.product_id)
    if (updError) setError('تعذّر تحديث الكمية')
    await load()
    setBusy(false)
  }

  async function removeItem(item) {
    setBusy(true)
    const { error: delError } = await supabase
      .from('package_items')
      .delete()
      .eq('package_id', packageId)
      .eq('product_id', item.product_id)
    if (delError) setError('تعذّر إزالة المنتج')
    await load()
    setBusy(false)
  }

  if (!items) {
    return (
      <div className="rounded-2xl bg-white border border-rose/15 p-6 flex justify-center">
        <span className="h-8 w-8 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-rose-dark">منتجات البكج</h2>
        <span className="text-sm text-taupe">{items.length} منتج</span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بكود المنتج أو اسمه لإضافته..."
          className="w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-rose/15 bg-white shadow-lg overflow-hidden">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => addProduct(p)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start hover:bg-blush/40 transition-colors"
              >
                <span className="text-sm">
                  {p.name_ar} <span className="text-taupe" dir="ltr">({p.code})</span>
                </span>
                <span className="text-xs font-bold text-rose-dark shrink-0">+ إضافة</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-taupe">لم تتم إضافة أي منتج بعد — ابحث بالأعلى بالكود أو الاسم.</p>
      ) : (
        <div className="divide-y divide-rose/10 rounded-xl border border-rose/10 overflow-hidden">
          {items.map((item) => {
            const p = productsById[item.product_id]
            return (
              <div key={item.product_id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  {p ? (
                    <>
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="text-sm font-medium leading-snug line-clamp-1 hover:text-rose-dark transition-colors"
                      >
                        {p.name_ar}
                      </Link>
                      <p className="text-xs text-taupe" dir="ltr">
                        {p.code}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-taupe">منتج محذوف</p>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item, Number(e.target.value))}
                  disabled={busy}
                  className="w-16 rounded-lg border border-rose/20 px-2 py-1 text-center"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  disabled={busy}
                  className="text-xs font-bold text-red-700 hover:text-red-800 disabled:opacity-50"
                >
                  إزالة
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}
    </div>
  )
}

export default PackageItems
