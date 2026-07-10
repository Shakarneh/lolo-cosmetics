import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Offers from './pages/Offers.jsx'
import About from './pages/About.jsx'
import { AuthProvider } from './admin/AuthContext.jsx'
import AdminLogin from './admin/Login.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/Dashboard.jsx'
import AdminProducts from './admin/ProductsList.jsx'
import AdminProductForm from './admin/ProductForm.jsx'
import AdminReviews from './admin/ReviewsQueue.jsx'

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MotionConfig>
  )
}

export default App
