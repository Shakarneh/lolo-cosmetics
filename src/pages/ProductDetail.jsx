import { Link, useParams } from 'react-router-dom'
import products from '../data/products.json'
import { categoryNames, categoryEmoji } from '../data/categories.js'
import { whatsappLink } from '../lib/whatsapp.js'
import { WhatsAppIcon } from '../components/icons.jsx'

function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-rose-dark mb-4">المنتج غير موجود</h1>
        <Link to="/products" className="text-rose-dark underline">
          العودة لكل المنتجات
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
        {product.image ? (
          <img src={product.image} alt={product.nameAr} className="aspect-square w-full object-cover" />
        ) : (
          <div className="aspect-square w-full bg-blush/50 flex flex-col items-center justify-center gap-3">
            <span className="text-7xl">{categoryEmoji[product.category] ?? '🛍️'}</span>
            <span className="text-sm text-taupe">الصورة الحقيقية قريباً</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {product.brand && (
          <span className="text-sm font-serif tracking-[0.2em] text-taupe">{product.brand}</span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug">{product.nameAr}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/products/${product.category}`}
            className="rounded-full bg-blush/60 px-4 py-1.5 text-sm text-rose-dark hover:bg-blush transition-colors"
          >
            {categoryNames[product.category]}
          </Link>
          {product.size && (
            <span className="rounded-full border border-rose/20 px-4 py-1.5 text-sm text-taupe">
              {product.size}
            </span>
          )}
        </div>

        <p className="text-2xl font-bold text-rose-dark">
          {product.retailPrice != null ? `${product.retailPrice} ₪` : 'تواصل معنا لمعرفة السعر'}
        </p>

        <div className="rounded-2xl bg-white border border-rose/15 p-5 flex flex-col gap-4 text-start">
          <div>
            <h2 className="font-bold text-rose-dark mb-1">الوصف</h2>
            <p className="text-base leading-relaxed text-charcoal">
              {product.description || 'سيتم إضافة وصف المنتج قريباً.'}
            </p>
          </div>
          <div className="border-t border-rose/10 pt-4">
            <h2 className="font-bold text-rose-dark mb-1">طريقة الاستخدام</h2>
            <p className="text-base leading-relaxed text-charcoal">
              {product.howToUse || 'سيتم إضافة طريقة الاستخدام قريباً.'}
            </p>
          </div>
        </div>

        <a
          href={whatsappLink(product)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-white text-lg font-bold hover:opacity-90 transition-opacity"
        >
          <WhatsAppIcon className="w-6 h-6" />
          اطلب عبر واتساب
        </a>

        <p className="text-sm text-taupe">كود المنتج: {product.code}</p>
      </div>
    </section>
  )
}

export default ProductDetail
