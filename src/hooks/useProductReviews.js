import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Approved reviews for one product — pinned first, then newest.
// RLS already hides non-approved rows from visitors; the filter here is explicit anyway.
export function useProductReviews(productId) {
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    const { data, error: dbError } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, body, created_at, is_pinned, review_images(storage_path, position)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .order('position', { referencedTable: 'review_images' })
    if (dbError) setError(dbError)
    else setReviews(data)
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  return { reviews: reviews ?? [], loading: !reviews && !error, error, refetch: load }
}
