import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryNames } from '../data/categories.js'
import ProductCard from '../components/ProductCard.jsx'
import DataStatus from '../components/DataStatus.jsx'
import { useProducts } from '../hooks/useProducts.js'

// Category banner (Phase 7.4) — falls back to the plain header if the image is missing
function CategoryBanner({ category, title, count }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <>
        <h1 className="text-3xl font-bold text-rose-dark mb-2">{title}</h1>
        <p className="text-lg text-taupe mb-8">{count} منتج</p>
      </>
    )
  }

  return (
    <div className="relative rounded-3xl overflow-hidden border border-rose/15 mb-8">
      <img
        src={`/images/categories/${category}.webp`}
        alt=""
        onError={() => setFailed(true)}
        className="h-44 md:h-64 w-full object-cover"
      />
      {/* cream fade on the start side (right in RTL) so the title stays readable */}
      <div className="absolute inset-0 bg-gradient-to-l from-cream/85 via-cream/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold text-rose-dark">{title}</h1>
        <p className="text-lg text-charcoal/80 mt-1">{count} منتج</p>
      </div>
    </div>
  )
}

function Products() {
  const { category } = useParams()
  const { products, loading, error, refetch } = useProducts()

  if (category && !categoryNames[category]) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-rose-dark mb-4">القسم غير موجود</h1>
        <Link to="/products" className="text-rose-dark underline">
          عرض كل المنتجات
        </Link>
      </section>
    )
  }

  if (loading || error) return <DataStatus error={error} onRetry={refetch} />

  const list = category ? products.filter((p) => p.category === category) : products
  const title = category ? categoryNames[category] : 'كل المنتجات'

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      {category ? (
        <CategoryBanner category={category} title={title} count={list.length} />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-rose-dark mb-2">{title}</h1>
          <p className="text-lg text-taupe mb-8">{list.length} منتج</p>
        </>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}

export default Products
