import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// DB columns are snake_case — keep the camelCase names the UI already uses (same as products.json)
function mapProduct(row) {
  return {
    id: row.id,
    code: row.code,
    nameAr: row.name_ar,
    brand: row.brand,
    category: row.category,
    size: row.size,
    retailPrice: row.retail_price,
    onSale: row.on_sale,
    salePrice: row.sale_price,
    image: null, // real photos come from product_images (Phase 6+)
    description: row.description,
    howToUse: row.how_to_use,
    featured: row.featured,
  }
}

let cache = null // fetched once per visit, shared across pages

export function useProducts() {
  const [products, setProducts] = useState(cache)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    if (cache) {
      setProducts(cache)
      return
    }
    const { data, error: dbError } = await supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .order('code')
    if (dbError) {
      setError(dbError)
      return
    }
    cache = data.map(mapProduct)
    setProducts(cache)
  }, [])

  useEffect(() => {
    if (!cache) load()
  }, [load])

  return {
    products: products ?? [],
    loading: !products && !error,
    error,
    refetch: load,
  }
}
