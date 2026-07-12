import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import DataStatus from '../components/DataStatus.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { searchProducts } from '../lib/search.js'

function Search() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const { products, loading, error, refetch } = useProducts()

  if (loading || error) return <DataStatus error={error} onRetry={refetch} />

  const results = q ? searchProducts(products, q) : []

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <h1 className="text-2xl md:text-3xl font-bold text-rose-dark mb-1">نتائج البحث</h1>
      <p className="text-taupe mb-8">
        {q ? `${results.length} نتيجة لـ «${q}»` : 'اكتب كلمة للبحث عن منتج'}
      </p>

      {q && results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-taupe mb-4">لا توجد منتجات مطابقة لبحثك.</p>
          <Link to="/products" className="text-rose-dark underline">
            تصفّح كل المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Search
