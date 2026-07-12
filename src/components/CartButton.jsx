import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

// Header cart link with a live item-count badge.
function CartButton({ onClick, className = '' }) {
  const { count } = useCart()
  return (
    <Link
      to="/cart"
      onClick={onClick}
      aria-label={`سلة الطلبات${count ? ` (${count})` : ''}`}
      className={`relative p-2 text-charcoal hover:text-rose-dark transition-colors ${className}`}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

export default CartButton
