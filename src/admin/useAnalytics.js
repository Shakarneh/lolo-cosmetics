import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Fetches aggregated page-view data for an arbitrary window via the
// page_views_*_range functions (owner-only at the RLS level). start/end are ISO
// timestamp strings; end is EXCLUSIVE (pass the midnight after the last day).
export function useAnalytics(startISO, endISO) {
  const [state, setState] = useState(null) // { daily: [{day, views}], pages: [{path, views}] }
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!startISO || !endISO) return
    setError(null)
    setState(null)

    const [dailyRes, pathRes] = await Promise.all([
      supabase.rpc('page_views_daily_range', { start_ts: startISO, end_ts: endISO }),
      supabase.rpc('page_views_by_path_range', { start_ts: startISO, end_ts: endISO }),
    ])

    const dbError = dailyRes.error || pathRes.error
    if (dbError) {
      setError(dbError)
      return
    }
    setState({
      daily: (dailyRes.data ?? []).map((r) => ({ day: r.day, views: Number(r.views) })),
      pages: (pathRes.data ?? []).map((r) => ({ path: r.path, views: Number(r.views) })),
    })
  }, [startISO, endISO])

  useEffect(() => {
    load()
  }, [load])

  return { data: state, loading: !state && !error, error, refetch: load }
}
