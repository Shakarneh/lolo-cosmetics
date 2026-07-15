import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DataStatus from '../components/DataStatus.jsx'
import { useAdminPackages } from './useAdminPackages.js'

const badgeTones = {
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

function PackagesList() {
  const { packages, loading, error, refetch } = useAdminPackages()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return packages
    return packages.filter((p) => p.name_ar.toLowerCase().includes(q))
  }, [packages, search])

  if (loading || error) return <DataStatus error={error} onRetry={refetch} label="البكجات" />

  const isFiltering = search.trim() !== ''

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">البكجات</h1>
        <span className="text-taupe">{packages.length} بكج</span>
        <Link
          to="/admin/packages/new"
          className="ms-auto rounded-full bg-rose px-5 py-2 text-sm text-white font-bold hover:bg-rose-dark transition-colors"
        >
          + إضافة بكج
        </Link>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث بالاسم..."
        className="rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
      />

      {isFiltering && <p className="text-sm text-taupe -mt-2">{filtered.length} نتيجة</p>}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-lg text-taupe">
          {packages.length === 0 ? 'لا توجد بكجات بعد — أضف أول بكج من الأعلى.' : 'لا توجد نتائج مطابقة'}
        </p>
      ) : (
        <div className="rounded-2xl bg-white border border-rose/15 divide-y divide-rose/10 overflow-hidden">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/admin/packages/${p.id}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 hover:bg-blush/30 transition-colors"
            >
              <div className="flex-1 min-w-[220px]">
                <p className="font-medium leading-snug line-clamp-1">{p.name_ar}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {!p.is_published && <Badge tone="hidden">مخفي</Badge>}
                {p.featured && <Badge tone="featured">مميزة</Badge>}
              </div>
              <span className="w-24 text-end font-bold">
                {p.price != null ? (
                  <span className="text-rose-dark">{p.price} ₪</span>
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

export default PackagesList
