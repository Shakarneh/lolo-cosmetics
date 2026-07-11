import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categoryEmoji } from '../data/categories.js'
import { whatsappLink } from '../lib/whatsapp.js'
import { socials } from '../data/socials.js'
import { WhatsAppIcon, InstagramIcon, SnapchatIcon } from './icons.jsx'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

function ProductCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay: (index % 4) * 0.06, ease: 'easeOut' },
      }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      whileHover={{ y: -4, transition: { duration: 0.18, delay: 0 } }}
      className="group rounded-2xl bg-white border border-rose/15 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <Link to={`/product/${product.id}`} className="block relative">
        {product.onSale && product.salePrice != null && (
          <span className="absolute top-2 start-2 z-10 rounded-full bg-rose px-2.5 py-0.5 text-[11px] font-bold text-white">
            عرض
          </span>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.nameAr}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="aspect-square w-full bg-blush/50 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
            {categoryEmoji[product.category] ?? '🛍️'}
          </div>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.brand && (
          <span className="text-[11px] font-serif tracking-wider text-taupe">{product.brand}</span>
        )}
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-medium leading-snug hover:text-rose-dark transition-colors line-clamp-2"
        >
          {product.nameAr}
        </Link>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {product.onSale && product.salePrice != null ? (
            <span className="font-bold text-rose-dark text-base">
              {product.salePrice} ₪{' '}
              <span className="text-xs font-normal text-taupe line-through">{product.retailPrice} ₪</span>
            </span>
          ) : (
            <span className={`font-bold text-rose-dark ${product.retailPrice != null ? 'text-base' : 'text-xs'}`}>
              {product.retailPrice != null ? `${product.retailPrice} ₪` : 'تواصل معنا للسعر'}
            </span>
          )}
          <div className="shrink-0 flex items-center gap-1.5">
            <a
              href={whatsappLink(product)}
              target="_blank"
              rel="noreferrer"
              aria-label={`اطلب ${product.nameAr} عبر واتساب`}
              className="rounded-full bg-[#25D366] p-2 text-white hover:opacity-90 transition-opacity"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
            <a
              href={socials.instagramDm}
              target="_blank"
              rel="noreferrer"
              aria-label={`اطلب ${product.nameAr} عبر انستغرام`}
              style={instagramGradient}
              className="rounded-full p-2 text-white hover:opacity-90 transition-opacity"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={socials.snapchat}
              target="_blank"
              rel="noreferrer"
              aria-label={`اطلب ${product.nameAr} عبر سناب شات`}
              className="rounded-full bg-[#FFFC00] p-2 text-charcoal hover:opacity-90 transition-opacity"
            >
              <SnapchatIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
