import products from '../data/products.json'
import ProductCard from '../components/ProductCard.jsx'

function Offers() {
  const onSale = products.filter((p) => p.onSale)

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-rose-dark mb-3 text-center">عروض وخصومات 🎁</h1>
      {onSale.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <span className="text-6xl">🛍️</span>
          <p className="text-xl text-charcoal font-medium">لا توجد عروض حالياً</p>
          <p className="text-lg text-taupe">ترقبوا أقوى العروض والخصومات قريباً!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {onSale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Offers
