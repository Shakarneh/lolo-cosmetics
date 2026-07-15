import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header.jsx'
import BrandFooter from './BrandFooter.jsx'
import { logPageView } from '../lib/analytics.js'

function Layout() {
  const { pathname } = useLocation()
  const loggedPathRef = useRef(null)

  useEffect(() => {
    // قفزة فورية لأعلى الصفحة عند تغيير المسار — تتجاوز scroll-behavior: smooth
    window.scrollTo({ top: 0, behavior: 'instant' })
    // React StrictMode (dev only) runs this effect twice per navigation — the ref
    // survives that double-invoke and stops the second call from double-logging.
    if (loggedPathRef.current !== pathname) {
      loggedPathRef.current = pathname
      logPageView(pathname)
    }
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <BrandFooter />
    </div>
  )
}

export default Layout
