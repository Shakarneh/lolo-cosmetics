import { Link, useParams } from 'react-router-dom'

const titles = {
  makeup: 'المكياج',
  skincare: 'العناية بالبشرة',
  body: 'العناية بالجسم',
  hair: 'العناية بالشعر',
  perfume: 'العطور',
  other: 'مستلزمات أخرى',
}

function Products() {
  const { category } = useParams()

  if (category && !titles[category]) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-rose-dark mb-4">القسم غير موجود</h1>
        <Link to="/products" className="text-rose-dark underline">
          عرض كل المنتجات
        </Link>
      </section>
    )
  }

  const title = category ? titles[category] : 'كل المنتجات'

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-rose-dark mb-2">{title}</h1>
      <p className="text-lg text-taupe mb-10">
        سيتم عرض المنتجات هنا في المرحلة الثانية — الكتالوج قيد التحضير 🛍️
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-blush/60 border border-rose/15 animate-pulse"
          />
        ))}
      </div>
    </section>
  )
}

export default Products
