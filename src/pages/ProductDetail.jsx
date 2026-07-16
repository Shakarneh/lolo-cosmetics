import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categoryNames, categoryEmoji } from '../data/categories.js'
import { whatsappLink } from '../lib/whatsapp.js'
import { priceRange } from '../lib/variations.js'
import { formatRange } from '../lib/price.js'
import { socials } from '../data/socials.js'
import { WhatsAppIcon, InstagramIcon, SnapchatIcon } from '../components/icons.jsx'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}
import DataStatus from '../components/DataStatus.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import ProductGallery from '../components/ProductGallery.jsx'
import ProductReviews from '../components/ProductReviews.jsx'
import ReviewFormSection from '../components/ReviewForm.jsx'
import Stars from '../components/Stars.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { useProductReviews } from '../hooks/useProductReviews.js'

function ProductDetail() {
  const { id } = useParams()
  const { products, loading, error, refetch } = useProducts()
  const { reviews } = useProductReviews(id)
  const [choices, setChoices] = useState({})

  const productName = products.find((p) => p.id === id)?.nameAr
  useEffect(() => {
    if (productName) document.title = `${productName} — لولو كوزمتكس`
  }, [productName])

  if (loading || error) return <DataStatus error={error} onRetry={refetch} />

  const product = products.find((p) => p.id === id)
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

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

  const variable = !!product.variations?.variants?.length
  const attributes = product.variations?.attributes ?? []
  const variants = product.variations?.variants ?? []
  const allChosen = variable && attributes.every((a) => choices[a.name])
  const selectedVariant = allChosen
    ? variants.find((v) => attributes.every((a) => v.values[a.name] === choices[a.name]))
    : null

  return (
    <>
    <section className="mx-auto max-w-5xl px-4 py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {product.images.length > 0 || product.video ? (
          <ProductGallery
            images={product.images}
            video={product.video}
            videoPosition={product.videoPosition}
            alt={product.nameAr}
          />
        ) : (
          <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
            <div className="aspect-square w-full bg-blush/50 flex flex-col items-center justify-center gap-3">
              <span className="text-7xl">{categoryEmoji[product.category] ?? '🛍️'}</span>
              <span className="text-sm text-taupe">الصورة الحقيقية قريباً</span>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        className="flex flex-col gap-4"
      >
        {product.brand && (
          <span className="text-sm font-serif tracking-[0.2em] text-taupe">{product.brand}</span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold leading-snug">{product.nameAr}</h1>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 -mt-1">
            <Stars rating={avgRating} />
            <span className="text-sm text-taupe">
              {avgRating.toFixed(1)} · {reviews.length} تقييم
            </span>
          </div>
        )}

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

        {variable ? (
          <p className="text-2xl font-bold text-rose-dark">
            {selectedVariant
              ? selectedVariant.price != null
                ? `${selectedVariant.price} ₪`
                : 'تواصل معنا لمعرفة السعر'
              : formatRange(priceRange(variants))}
          </p>
        ) : product.onSale && product.salePrice != null ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-rose-dark">{product.salePrice} ₪</p>
            <p className="text-lg text-taupe line-through">{product.retailPrice} ₪</p>
            <span className="rounded-full bg-rose px-3 py-1 text-xs font-bold text-white">عرض 🎁</span>
          </div>
        ) : (
          <p className="text-2xl font-bold text-rose-dark">
            {product.retailPrice != null ? `${product.retailPrice} ₪` : 'تواصل معنا لمعرفة السعر'}
          </p>
        )}

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

        {variable && (
          <div className="flex flex-col gap-3">
            {attributes.map((a) => (
              <div key={a.name}>
                <p className="text-sm font-medium mb-1.5">{a.name}</p>
                <div className="flex flex-wrap gap-2">
                  {a.values.map((v) => {
                    const active = choices[a.name] === v
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setChoices({ ...choices, [a.name]: v })}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          active
                            ? 'border-rose bg-rose text-white'
                            : 'border-rose/30 text-charcoal hover:bg-blush'
                        }`}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {!allChosen && <p className="text-xs text-taupe">اختر كل الخيارات لعرض السعر وإضافته للسلة.</p>}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <AddToCartButton
            product={product}
            size="lg"
            className="w-full"
            variantKey={selectedVariant?.key ?? null}
            disabled={variable && !allChosen}
          />
          <a
            href={whatsappLink(product, selectedVariant)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-white text-lg font-bold hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-6 h-6" />
            اطلب عبر واتساب
          </a>
          <div className="flex gap-2.5">
            <a
              href={socials.instagramDm}
              target="_blank"
              rel="noreferrer"
              style={instagramGradient}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-white font-bold hover:opacity-90 transition-opacity"
            >
              <InstagramIcon className="w-5 h-5" />
              اطلب عبر انستغرام
            </a>
            <a
              href={socials.snapchat}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFC00] px-4 py-2.5 text-charcoal font-bold hover:opacity-90 transition-opacity"
            >
              <SnapchatIcon className="w-5 h-5" />
              اطلب عبر سناب شات
            </a>
          </div>
        </div>

        <p className="text-sm text-taupe">كود المنتج: {product.code}</p>
      </motion.div>
    </section>

    <ProductReviews reviews={reviews} />
    <ReviewFormSection productId={product.id} />
    </>
  )
}

export default ProductDetail
