import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useProducts } from '../hooks/useProducts.js'
import DataStatus from '../components/DataStatus.jsx'
import { categoryEmoji } from '../data/categories.js'
import { cartMessage, cartWhatsappLink } from '../lib/whatsapp.js'
import { socials } from '../data/socials.js'
import { WhatsAppIcon, InstagramIcon, SnapchatIcon, FacebookIcon } from '../components/icons.jsx'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

function unitPrice(p) {
  return p.onSale && p.salePrice != null ? p.salePrice : p.retailPrice
}

function Cart() {
  const { items, setQty, removeItem, clear } = useCart()
  const { products, loading, error, refetch } = useProducts()
  const [copied, setCopied] = useState(false)

  if (loading || error) return <DataStatus error={error} onRetry={refetch} />

  // resolve cart lines against the live catalog; drop items no longer published
  const lines = items
    .map((it) => {
      const p = products.find((x) => x.id === it.id)
      return p ? { ...p, qty: it.qty } : null
    })
    .filter(Boolean)

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h1 className="text-2xl md:text-3xl font-bold text-rose-dark mb-2">سلة الطلبات فارغة</h1>
        <p className="text-taupe mb-6">أضف بعض المنتجات ثم أرسل طلبك عبر واتساب.</p>
        <Link
          to="/products"
          className="inline-flex rounded-full bg-rose px-6 py-3 font-bold text-white hover:bg-rose-dark transition-colors"
        >
          تصفّح المنتجات
        </Link>
      </section>
    )
  }

  const entries = lines.map((l) => ({ nameAr: l.nameAr, code: l.code, qty: l.qty, unitPrice: unitPrice(l) }))
  const priced = entries.filter((e) => e.unitPrice != null)
  const total = priced.reduce((sum, e) => sum + e.unitPrice * e.qty, 0)
  const somePriceless = priced.length < entries.length

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(cartMessage(entries))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-rose-dark">سلة الطلبات</h1>
        <button type="button" onClick={clear} className="text-sm text-taupe hover:text-rose-dark transition-colors">
          إفراغ السلة
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {lines.map((l) => {
          const price = unitPrice(l)
          return (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-white border border-rose/15 p-3">
              <Link to={`/product/${l.id}`} className="shrink-0 w-20 h-20 rounded-xl bg-blush/40 overflow-hidden flex items-center justify-center">
                {l.image ? (
                  <img src={l.image} alt={l.nameAr} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-3xl">{categoryEmoji[l.category] ?? '🛍️'}</span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link to={`/product/${l.id}`} className="block text-sm font-medium leading-snug line-clamp-2 hover:text-rose-dark transition-colors">
                  {l.nameAr}
                </Link>
                <p className="mt-1 text-sm font-bold text-rose-dark">
                  {price != null ? `${price} ₪` : 'تواصل معنا للسعر'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 rounded-full border border-rose/25 p-0.5">
                  <button
                    type="button"
                    onClick={() => setQty(l.id, l.qty - 1)}
                    aria-label="إنقاص"
                    className="w-7 h-7 rounded-full text-rose-dark hover:bg-blush transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm font-bold tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(l.id, l.qty + 1)}
                    aria-label="زيادة"
                    className="w-7 h-7 rounded-full text-rose-dark hover:bg-blush transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(l.id)}
                  className="text-xs text-taupe hover:text-rose-dark transition-colors"
                >
                  إزالة
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* summary + checkout */}
      <div className="mt-6 rounded-2xl bg-white border border-rose/15 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-bold text-charcoal">الإجمالي التقريبي</span>
          <span className="font-bold text-rose-dark">{total} ₪</span>
        </div>
        {somePriceless && (
          <p className="-mt-2 text-sm text-taupe">بعض المنتجات بحاجة إلى تسعير — سيتم تأكيدها عبر المحادثة.</p>
        )}

        <a
          href={cartWhatsappLink(entries)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-white text-lg font-bold hover:opacity-90 transition-opacity"
        >
          <WhatsAppIcon className="w-6 h-6" />
          أرسل الطلب عبر واتساب
        </a>

        <div className="flex items-center gap-2.5">
          <a
            href={socials.instagramDm}
            target="_blank"
            rel="noreferrer"
            style={instagramGradient}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <InstagramIcon className="w-5 h-5" />
            انستغرام
          </a>
          {socials.snapchat && (
            <a
              href={socials.snapchat}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFC00] px-4 py-2.5 text-charcoal font-bold hover:opacity-90 transition-opacity"
            >
              <SnapchatIcon className="w-5 h-5" />
              سناب شات
            </a>
          )}
          {socials.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1877F2] px-4 py-2.5 text-white font-bold hover:opacity-90 transition-opacity"
            >
              <FacebookIcon className="w-5 h-5" />
              فيسبوك
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={copyOrder}
          className="text-sm text-taupe hover:text-rose-dark transition-colors"
        >
          {copied ? 'تم نسخ الطلب ✓' : 'انسخ قائمة الطلب (للإرسال عبر انستغرام أو سناب شات)'}
        </button>

        <p className="text-center text-sm text-taupe">توصيل للضفة والقدس 🚚 — التفاصيل عبر المحادثة</p>
      </div>
    </section>
  )
}

export default Cart
