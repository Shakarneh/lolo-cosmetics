import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { categories } from '../data/categories.js'

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-rose-dark' : 'text-charcoal hover:text-rose-dark'
  }`

function Header() {
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeAll = () => {
    setProductsOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-rose/20">
      <div className="mx-auto max-w-6xl px-4 h-16 flex flex-row-reverse items-center justify-between">
        <Link to="/" className="flex flex-row-reverse items-center gap-3" onClick={closeAll}>
          <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-11 h-11 rounded-full" />
          <span className="leading-tight text-start">
            <span className="block text-lg font-bold text-rose-dark">لولو كوزمتكس</span>
            <span className="block text-[11px] tracking-[0.2em] text-taupe font-serif">
              LOLO COSMETICS
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            الرئيسية
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setProductsOpen((v) => !v)}
              className="px-3 py-2 text-sm font-medium text-charcoal hover:text-rose-dark transition-colors flex items-center gap-1"
            >
              المنتجات
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute start-0 top-full w-56 rounded-2xl bg-white shadow-xl border border-rose/15 p-2"
                >
                  <Link
                    to="/products"
                    onClick={closeAll}
                    className="block rounded-xl px-4 py-2.5 text-sm font-bold text-rose-dark hover:bg-cream transition-colors"
                  >
                    كل المنتجات
                  </Link>
                  <div className="my-1 border-t border-rose/15" />
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/products/${c.slug}`}
                      onClick={closeAll}
                      className="block rounded-xl px-4 py-2.5 text-sm text-charcoal hover:bg-cream hover:text-rose-dark transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink to="/offers" className={navLinkClass}>
            عروض وخصومات
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            من نحن
          </NavLink>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-charcoal"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="القائمة"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-rose/15 bg-cream"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              <Link to="/" onClick={closeAll} className="rounded-xl px-3 py-2.5 font-medium hover:bg-blush/60">
                الرئيسية
              </Link>
              <p className="px-3 pt-2 pb-1 text-xs text-taupe">المنتجات</p>
              <Link
                to="/products"
                onClick={closeAll}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-rose-dark hover:bg-blush/60"
              >
                كل المنتجات
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/products/${c.slug}`}
                  onClick={closeAll}
                  className="rounded-xl px-5 py-2.5 text-sm hover:bg-blush/60"
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/offers" onClick={closeAll} className="rounded-xl px-3 py-2.5 font-medium hover:bg-blush/60">
                عروض وخصومات
              </Link>
              <Link to="/about" onClick={closeAll} className="rounded-xl px-3 py-2.5 font-medium hover:bg-blush/60">
                من نحن
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
