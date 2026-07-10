import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('مفاتيح Supabase غير موجودة — تأكد من ملف .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
