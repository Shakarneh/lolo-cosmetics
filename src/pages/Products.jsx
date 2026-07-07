import { Link, useParams } from 'react-router-dom'
import products from '../data/products.json'
import { categoryNames } from '../data/categories.js'
import ProductCard from '../components/ProductCard.jsx'

function Products() {
  const { category } = useParams()

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

  const list = category ? products.filter((p) => p.category === category) : products
  const title = category ? categoryNames[category] : 'كل المنتجات'

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-rose-dark mb-2">{title}</h1>
      <p className="text-lg text-taupe mb-8">{list.length} منتج</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

export default Products
