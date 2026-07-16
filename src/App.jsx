import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Offers from './pages/Offers.jsx'
import Packages from './pages/Packages.jsx'
import PackageDetail from './pages/PackageDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Search from './pages/Search.jsx'
import Cart from './pages/Cart.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './admin/AuthContext.jsx'

// لوحة التحكم تُحمَّل فقط عند فتح /admin — الزبائن لا يحمّلون كودها إطلاقاً
// (Lighthouse: كانت ~122KB جافاسكربت غير مستخدمة على الصفحة الرئيسية)
const AdminLogin = lazy(() => import('./admin/Login.jsx'))
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const AdminDashboard = lazy(() => import('./admin/Dashboard.jsx'))
const AdminProducts = lazy(() => import('./admin/ProductsList.jsx'))
const AdminProductForm = lazy(() => import('./admin/ProductForm.jsx'))
const AdminPackages = lazy(() => import('./admin/PackagesList.jsx'))
const AdminPackageForm = lazy(() => import('./admin/PackageForm.jsx'))
const AdminReviews = lazy(() => import('./admin/ReviewsQueue.jsx'))
const AdminUsers = lazy(() => import('./admin/UsersManager.jsx'))
const AdminAnalytics = lazy(() => import('./admin/Analytics.jsx'))

const adminFallback = (
  <div className="min-h-screen flex items-center justify-center bg-cream text-taupe">
    جاري التحميل...
  </div>
)

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CartProvider>
        <Suspense fallback={adminFallback}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/package/:id" element={<PackageDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="packages/new" element={<AdminPackageForm />} />
            <Route path="packages/:id" element={<AdminPackageForm />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
        </Suspense>
        </CartProvider>
      </AuthProvider>
    </MotionConfig>
  )
}

export default App
