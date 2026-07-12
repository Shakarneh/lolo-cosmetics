import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryEmoji } from '../data/categories.js'
import { useProducts } from '../hooks/useProducts.js'
import { searchProducts } from '../lib/search.js'
import { priceLabel } from '../lib/price.js'

// Search input with a live dropdown of the top matches. Used in the header (desktop
// center) and the mobile search bar. Enter or «عرض كل النتائج» → /search results page.
function SearchBox({ autoFocus = false, onNavigate }) {
  const { products } = useProducts()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  const query = q.trim()
  const results = query ? searchProducts(products, query, 6) : []

  useEffect(() => {
    function onDocMouseDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  function go(to) {
    setOpen(false)
    setQ('')
    onNavigate?.()
    navigate(to)
  }

  function onSubmit(e) {
    e.preventDefault()
    if (query) go(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit} className="relative">
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="ابحث عن منتج..."
          aria-label="ابحث عن منتج"
          className="w-full rounded-full border border-rose/30 bg-white/90 ps-10 pe-4 py-2 text-sm text-charcoal placeholder:text-taupe focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-taupe">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l3.5 3.5" strokeLinecap="round" />
          </svg>
        </span>
      </form>

      {open && query && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white shadow-xl border border-rose/15 overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-taupe text-center">لا توجد نتائج مطابقة</p>
          ) : (
            <>
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(`/product/${p.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-cream transition-colors"
                >
                  <span className="shrink-0 w-11 h-11 rounded-lg bg-blush/40 overflow-hidden flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <span className="text-xl">{categoryEmoji[p.category] ?? '🛍️'}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-charcoal line-clamp-1">{p.nameAr}</span>
                    <span className="block text-xs font-bold text-rose-dark">{priceLabel(p)}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
                className="w-full border-t border-rose/15 px-4 py-2.5 text-sm font-bold text-rose-dark hover:bg-cream transition-colors"
              >
                عرض كل النتائج
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
