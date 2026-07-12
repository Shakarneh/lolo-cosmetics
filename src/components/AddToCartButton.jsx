import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'

function CartPlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  )
}

// Adds one unit of the product (optionally a chosen variation) to the cart, with a brief
// confirmation state. size: 'sm' (cards) | 'lg' (product detail). disabled = e.g. a variation
// product with no selection yet. Quantities are adjusted on the cart page.
function AddToCartButton({ product, variantKey = null, size = 'sm', className = '', disabled = false }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    addItem(product.id, 1, variantKey)
    setAdded(true)
    setTimeout(() => setAdded(false), 1300)
  }

  const pad = size === 'lg' ? 'px-8 py-3.5 text-lg gap-2.5' : 'px-3 py-2 text-sm gap-2'
  const icon = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  const color = disabled
    ? 'bg-rose/40 text-white cursor-not-allowed'
    : added
      ? 'bg-emerald-500 text-white'
      : 'bg-rose text-white hover:bg-rose-dark'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`أضف ${product.nameAr} للسلة`}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-colors ${pad} ${color} ${className}`}
    >
      <CartPlusIcon className={icon} />
      {added ? 'تمت الإضافة ✓' : 'أضف للسلة'}
    </button>
  )
}

export default AddToCartButton
