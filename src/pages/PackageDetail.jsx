import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WhatsAppIcon, InstagramIcon, SnapchatIcon } from '../components/icons.jsx'
import { socials } from '../data/socials.js'
import { packageWhatsappLink } from '../lib/whatsapp.js'
import DataStatus from '../components/DataStatus.jsx'
import ProductGallery from '../components/ProductGallery.jsx'
import { usePackages } from '../hooks/usePackages.js'
import { useProducts } from '../hooks/useProducts.js'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

function PackageDetail() {
  const { id } = useParams()
  const { packages, loading: loadingPkgs, error: errorPkgs, refetch: refetchPkgs } = usePackages()
  const { products, loading: loadingProducts, error: errorProducts, refetch: refetchProducts } = useProducts()

  if (loadingPkgs || errorPkgs) return <DataStatus error={errorPkgs} onRetry={refetchPkgs} label="البكجات" />
  if (loadingProducts || errorProducts) return <DataStatus error={errorProducts} onRetry={refetchProducts} />

  const pkg = packages.find((p) => p.id === id)

  if (!pkg) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-rose-dark mb-4">البكج غير موجود</h1>
        <Link to="/packages" className="text-rose-dark underline">
          العودة لكل البكجات
        </Link>
      </section>
    )
  }

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]))
  const resolvedItems = pkg.items
    .map((i) => ({ ...i, product: productsById[i.productId] }))
    .filter((i) => i.product)

  const orderEntries = resolvedItems.map((i) => ({
    nameAr: i.product.nameAr,
    code: i.product.code,
    quantity: i.quantity,
  }))

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {pkg.images.length > 0 ? (
          <ProductGallery images={pkg.images} alt={pkg.nameAr} />
        ) : (
          <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
            <div className="aspect-square w-full bg-blush/50 flex flex-col items-center justify-center gap-3">
              <span className="text-7xl">🎁</span>
              <span className="text-sm text-taupe">الصورة قريباً</span>
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
        <span className="rounded-full bg-blush/60 px-4 py-1.5 text-sm text-rose-dark self-start">
          بكج · {resolvedItems.length} منتج
        </span>
        <h1 className="text-2xl md:text-3xl font-bold leading-snug">{pkg.nameAr}</h1>

        <p className="text-2xl font-bold text-rose-dark">
          {pkg.price != null ? `${pkg.price} ₪` : 'تواصل معنا لمعرفة السعر'}
        </p>

        {pkg.description && (
          <div className="rounded-2xl bg-white border border-rose/15 p-5 text-start">
            <p className="text-base leading-relaxed text-charcoal">{pkg.description}</p>
          </div>
        )}

        <div className="rounded-2xl bg-white border border-rose/15 p-5 flex flex-col gap-3 text-start">
          <h2 className="font-bold text-rose-dark">يحتوي هذا البكج على</h2>
          <div className="flex flex-col gap-3">
            {resolvedItems.map((i) => (
              <Link
                key={i.productId}
                to={`/product/${i.productId}`}
                className="flex items-center gap-3 hover:bg-blush/30 rounded-xl p-1.5 -m-1.5 transition-colors"
              >
                {i.product.image ? (
                  <img
                    src={i.product.image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-rose/10 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-blush/50 flex items-center justify-center text-xl">🛍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{i.product.nameAr}</p>
                  <p className="text-xs text-taupe">الكمية: {i.quantity}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <a
            href={packageWhatsappLink(pkg, orderEntries)}
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
      </motion.div>
    </section>
  )
}

export default PackageDetail
