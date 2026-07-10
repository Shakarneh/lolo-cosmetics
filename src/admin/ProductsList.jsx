import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryNames } from '../data/categories.js'
import DataStatus from '../components/DataStatus.jsx'
import { useAdminProducts } from './useAdminProducts.js'

const badgeTones = {
  category: 'bg-blush/60 text-rose-dark',
  sale: 'bg-rose text-white',
  featured: 'bg-rose/15 text-rose-dark',
  hidden: 'bg-charcoal/10 text-charcoal/70',
}

function Badge({ tone, children }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeTones[tone]}`}>
      {children}
    </span>
  )
}

function ProductsList() {
  const { products, loading, error, refetch } = useAdminProducts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return (
        p.name_ar.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q)
      )
    })
  }, [products, search, category])

  if (loading || error) return <DataStatus error={error} onRetry={refetch} />

  const noPriceCount = products.filter((p) => p.retail_price == null).length
  const isFiltering = search.trim() !== '' || category !== 'all'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">المنتجات</h1>
        <span className="text-taupe">{products.length} منتج</span>
        {noPriceCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {noPriceCount} بدون سعر
          </span>
        )}
        <Link
          to="/admin/products/new"
          className="ms-auto rounded-full bg-rose px-5 py-2 text-sm text-white font-bold hover:bg-rose-dark transition-colors"
        >
          + إضافة منتج
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو الكود أو الماركة..."
          className="flex-1 rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose sm:w-48"
        >
          <option value="all">كل الأقسام</option>
          {Object.entries(categoryNames).map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {isFiltering && (
        <p className="text-sm text-taupe -mt-2">{filtered.length} نتيجة</p>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-lg text-taupe">لا توجد نتائج مطابقة</p>
      ) : (
        <div className="rounded-2xl bg-white border border-rose/15 divide-y divide-rose/10 overflow-hidden">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/admin/products/${p.id}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 hover:bg-blush/30 transition-colors"
            >
              <div className="flex-1 min-w-[220px]">
                <p className="font-medium leading-snug line-clamp-1">{p.name_ar}</p>
                <p className="text-xs text-taupe mt-0.5">
                  <span dir="ltr">{p.code}</span>
                  {p.brand && <> · {p.brand}</>}
                </p>
              </div>
              <Badge tone="category">{categoryNames[p.category] ?? p.category}</Badge>
              <div className="flex items-center gap-1.5">
                {!p.is_published && <Badge tone="hidden">مخفي</Badge>}
                {p.featured && <Badge tone="featured">مميز</Badge>}
                {p.on_sale && <Badge tone="sale">عرض {p.sale_price} ₪</Badge>}
              </div>
              <span className="w-24 text-end font-bold">
                {p.retail_price != null ? (
                  <span className="text-rose-dark">{p.retail_price} ₪</span>
                ) : (
                  <span className="text-xs font-medium text-amber-700">بدون سعر</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsList
