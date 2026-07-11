import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryNames } from '../data/categories.js'
import ProductCard from '../components/ProductCard.jsx'
import DataStatus from '../components/DataStatus.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { generalWhatsappLink } from '../lib/whatsapp.js'
import { WhatsAppIcon } from '../components/icons.jsx'

// One banner file per category — extensions differ because some are the user's own photos
const categoryBannerSrc = {
  makeup: '/images/categories/makeup.webp',
  skincare: '/images/categories/skincare.png', // owner's photo (2026-07-11)
  body: '/images/categories/body.png', // owner's photo (2026-07-11)
  hair: '/images/categories/hair.png', // owner's photo (2026-07-11)
  perfume: '/images/categories/perfume.png', // owner's photo (2026-07-11)
  other: '/images/categories/other.webp',
}

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
        src={categoryBannerSrc[category]}
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

// «كل المنتجات» header (user's photo): cosmetics flatlay, products on the LEFT,
// title over the empty marble area on the RIGHT — same sizing as CategoryBanner
function AllProductsBanner({ count }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-14">
        <h1 className="text-3xl font-bold text-rose-dark mb-2">كل المنتجات</h1>
        <p className="text-lg text-taupe">{count} منتج</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video md:aspect-auto md:h-[28rem] overflow-hidden">
      <img
        src="/images/all-products-banner.png"
        alt=""
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-cream/80 via-cream/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
      <div className="relative h-full mx-auto max-w-6xl px-4 flex flex-col justify-center items-start">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-dark">كل المنتجات</h1>
        <p className="text-lg text-charcoal/80 mt-2">{count} منتج</p>
      </div>
    </div>
  )
}

// closing brand strip (user's photo): model on the RIGHT, tagline + WhatsApp CTA
// over the empty pink area on the LEFT (justify-end = physical left in RTL)
function BrandStrip() {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <div className="relative overflow-hidden">
      <img
        src="/images/all-products-strip.png"
        alt=""
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover object-[85%_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cream/85 via-cream/30 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cream to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 h-72 md:h-96 flex items-center justify-end">
        <div className="max-w-xs md:max-w-sm flex flex-col items-center text-center gap-4">
          <p className="text-2xl md:text-3xl font-bold text-rose-dark leading-relaxed">
            إطلالتك اليومية تبدأ من هنا 🌸
          </p>
          <p className="text-base md:text-lg text-taupe">جودة عالية · عناية فاخرة · أسعار مناسبة</p>
          <a
            href={generalWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-5 h-5" />
            تواصل معنا
          </a>
        </div>
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
    {category ? (
      <CategoryBanner category={category} title={title} count={list.length} />
    ) : (
      <AllProductsBanner count={list.length} />
    )}
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
    <BrandStrip />
    </>
  )
}

export default Products
