import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryNames } from '../data/categories.js'
import ProductCard from '../components/ProductCard.jsx'
import DataStatus from '../components/DataStatus.jsx'
import { useProducts } from '../hooks/useProducts.js'

// Category background header (Phase 7.4) — full-bleed image that dissolves into the page;
// falls back to the plain header if the image is missing
function CategoryBanner({ category, title, count }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-14">
        <h1 className="text-3xl font-bold text-rose-dark mb-2">{title}</h1>
        <p className="text-lg text-taupe">{count} منتج</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video md:aspect-auto md:h-[28rem] overflow-hidden">
      <img
        src={`/images/categories/${category}.webp`}
        alt=""
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* cream wash over the start side (right in RTL) so the title stays readable */}
      <div className="absolute inset-0 bg-gradient-to-l from-cream/90 via-cream/40 to-cream/10" />
      {/* dissolve into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
      <div className="relative h-full mx-auto max-w-6xl px-4 flex flex-col justify-center items-start">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-dark">{title}</h1>
        <p className="text-lg text-charcoal/80 mt-2">{count} منتج</p>
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
    <>
    {category && <CategoryBanner category={category} title={title} count={list.length} />}
    <section className={`mx-auto max-w-6xl px-4 pb-14 ${category ? 'pt-6' : 'pt-14'}`}>
      {!category && (
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
    </>
  )
}

export default Products
