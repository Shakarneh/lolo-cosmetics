import { supabase } from './supabase.js'

// Fire-and-forget page view log — never blocks navigation and never
// surfaces an error to the visitor (analytics failing silently is fine).
export function logPageView(path) {
  supabase.from('page_views').insert({ path, referrer: document.referrer || null }).then(() => {})
}
