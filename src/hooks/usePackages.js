import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function mapPackage(row) {
  const images = (row.package_images ?? []).map(
    (img) => supabase.storage.from('package-images').getPublicUrl(img.storage_path).data.publicUrl
  )
  const items = (row.package_items ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ productId: i.product_id, quantity: i.quantity }))
  return {
    id: row.id,
    nameAr: row.name_ar,
    description: row.description,
    price: row.price,
    featured: row.featured,
    image: images[0] ?? null,
    images,
    items,
  }
}

let cache = null // fetched once per visit, shared across pages (same pattern as useProducts)

export function usePackages() {
  const [packages, setPackages] = useState(cache)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    if (cache) {
      setPackages(cache)
      return
    }
    const { data, error: dbError } = await supabase
      .from('packages')
      .select('*, package_images(storage_path, position), package_items(product_id, quantity, position)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .order('position', { referencedTable: 'package_images' })
    if (dbError) {
      setError(dbError)
      return
    }
    cache = data.map(mapPackage)
    setPackages(cache)
  }, [])

  useEffect(() => {
    if (!cache) load()
  }, [load])

  return {
    packages: packages ?? [],
    loading: !packages && !error,
    error,
    refetch: load,
  }
}
