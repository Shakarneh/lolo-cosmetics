import { Link, useParams } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-rose-dark mb-4">صفحة المنتج</h1>
      <p className="text-taupe mb-2">
        تفاصيل المنتج <span className="font-mono text-charcoal">{id}</span> ستظهر هنا في المرحلة الثانية.
      </p>
      <Link to="/products" className="text-rose-dark underline">
        العودة لكل المنتجات
      </Link>
    </section>
  )
}

export default ProductDetail
