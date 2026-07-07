import { Link } from 'react-router-dom'
import { categoryEmoji } from '../data/categories.js'
import { whatsappLink } from '../lib/whatsapp.js'
import { WhatsAppIcon } from './icons.jsx'

function ProductCard({ product }) {
  return (
    <div className="group rounded-2xl bg-white border border-rose/15 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <Link to={`/product/${product.id}`} className="block">
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
          <span className={`font-bold text-rose-dark ${product.retailPrice != null ? 'text-base' : 'text-xs'}`}>
            {product.retailPrice != null ? `${product.retailPrice} ₪` : 'تواصل معنا للسعر'}
          </span>
          <a
            href={whatsappLink(product)}
            target="_blank"
            rel="noreferrer"
            aria-label={`اطلب ${product.nameAr} عبر واتساب`}
            className="shrink-0 rounded-full bg-[#25D366] p-2 text-white hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
