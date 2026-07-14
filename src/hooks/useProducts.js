import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// DB columns are snake_case — keep the camelCase names the UI already uses (same as products.json)
function mapProduct(row) {
  // product_images come back ordered by position — first one is the main photo
  const images = (row.product_images ?? []).map(
    (img) => supabase.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl
  )
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
    image: images[0] ?? null,
    images,
    video: row.video_path
      ? supabase.storage.from('product-videos').getPublicUrl(row.video_path).data.publicUrl
      : null,
    description: row.description,
    howToUse: row.how_to_use,
    featured: row.featured,
    variations: row.variations ?? null,
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
      .select('*, product_images(storage_path, position)')
      .eq('is_published', true)
      .order('code')
      .order('position', { referencedTable: 'product_images' })
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
