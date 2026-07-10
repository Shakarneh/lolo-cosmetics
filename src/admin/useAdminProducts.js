import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Admin list: ALL products (incl. unpublished — RLS allows it for staff), raw DB rows
// (snake_case), no cache — after every edit the list refetches fresh data.
export function useAdminProducts() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setProducts(null)
    const { data, error: dbError } = await supabase.from('products').select('*').order('code')
    if (dbError) setError(dbError)
    else setProducts(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { products: products ?? [], loading: !products && !error, error, refetch: load }
}
