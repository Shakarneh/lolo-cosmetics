import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Admin list: ALL packages (incl. unpublished — RLS allows it for staff), raw DB rows.
export function useAdminPackages() {
  const [packages, setPackages] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setPackages(null)
    const { data, error: dbError } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
    if (dbError) setError(dbError)
    else setPackages(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { packages: packages ?? [], loading: !packages && !error, error, refetch: load }
}
