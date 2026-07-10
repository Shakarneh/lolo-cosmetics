import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import DataStatus from '../components/DataStatus.jsx'

const filters = [
  { key: 'pending', label: 'قيد المراجعة' },
  { key: 'approved', label: 'معتمدة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'all', label: 'الكل' },
]

const statusBadge = {
  pending: ['قيد المراجعة', 'bg-amber-100 text-amber-800'],
  approved: ['معتمد', 'bg-emerald-100 text-emerald-800'],
  rejected: ['مرفوض', 'bg-red-100 text-red-700'],
}

const dateFormat = new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' })

// bucket ships with Phase 7 (customer submission) — until then reviews simply have no photos
function reviewImageUrl(path) {
  return supabase.storage.from('review-images').getPublicUrl(path).data.publicUrl
}

function Stars({ rating }) {
  return (
    <span dir="ltr" className="text-amber-500">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

function ReviewsQueue() {
  const { session } = useAuth()
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    const { data, error: dbError } = await supabase
      .from('reviews')
      .select('*, products(name_ar), review_images(storage_path, position)')
      .order('created_at', { ascending: false })
    if (dbError) setError(dbError)
    else setReviews(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 }
    for (const r of reviews ?? []) c[r.status]++
    return c
  }, [reviews])

  if (!reviews || error) {
    return <DataStatus error={error} onRetry={load} />
  }

  const visible = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)

  async function run(review, action) {
    setBusyId(review.id)
    setActionError(null)
    let dbError = null
    if (action === 'delete') {
      const paths = (review.review_images ?? []).map((i) => i.storage_path)
      ;({ error: dbError } = await supabase.from('reviews').delete().eq('id', review.id))
      if (!dbError && paths.length) {
        await supabase.storage.from('review-images').remove(paths)
      }
    } else if (action === 'pin') {
      ;({ error: dbError } = await supabase
        .from('reviews')
        .update({ is_pinned: !review.is_pinned })
        .eq('id', review.id))
    } else {
      // approve / reject
      ;({ error: dbError } = await supabase
        .from('reviews')
        .update({
          status: action,
          is_pinned: action === 'approved' ? review.is_pinned : false,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
        })
        .eq('id', review.id))
    }
    if (dbError) setActionError('تعذّر تنفيذ الإجراء — حاول مجدداً')
    await load()
    setBusyId(null)
  }

  const btn = 'rounded-full px-4 py-1.5 text-xs font-bold transition-colors disabled:opacity-50'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-rose-dark">التقييمات</h1>
        {counts.pending > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {counts.pending} بانتظار المراجعة
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f.key ? 'bg-rose text-white font-bold' : 'text-taupe hover:bg-blush'
            }`}
          >
            {f.label}
            {f.key !== 'all' && counts[f.key] > 0 && ` (${counts[f.key]})`}
          </button>
        ))}
      </div>

      {actionError && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {actionError}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center text-lg text-taupe">
          {filter === 'pending' ? 'لا توجد تقييمات بانتظار المراجعة 🎉' : 'لا توجد تقييمات هنا'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => {
            const [label, badgeClass] = statusBadge[r.status]
            const busy = busyId === r.id
            return (
              <div key={r.id} className="rounded-2xl bg-white border border-rose/15 p-5 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/admin/products/${r.product_id}`}
                    className="font-medium text-rose-dark hover:underline line-clamp-1"
                  >
                    {r.products?.name_ar ?? r.product_id}
                  </Link>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>{label}</span>
                  {r.is_pinned && (
                    <span className="rounded-full bg-blush px-2.5 py-0.5 text-xs font-medium text-rose-dark">
                      📌 مثبت
                    </span>
                  )}
                  <span className="ms-auto text-xs text-taupe">{dateFormat.format(new Date(r.created_at))}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className="font-medium">{r.customer_name}</span>
                </div>

                <p className="leading-relaxed">{r.body}</p>

                {(r.review_images ?? []).length > 0 && (
                  <div className="flex gap-2">
                    {r.review_images.map((img) => (
                      <a key={img.storage_path} href={reviewImageUrl(img.storage_path)} target="_blank" rel="noreferrer">
                        <img
                          src={reviewImageUrl(img.storage_path)}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-rose/15"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-rose/10">
                  {r.status !== 'approved' && (
                    <button
                      disabled={busy}
                      onClick={() => run(r, 'approved')}
                      className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
                    >
                      اعتماد ✓
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      disabled={busy}
                      onClick={() => run(r, 'rejected')}
                      className={`${btn} border border-rose/25 text-rose-dark hover:bg-blush`}
                    >
                      رفض
                    </button>
                  )}
                  {r.status === 'approved' && (
                    <button
                      disabled={busy}
                      onClick={() => run(r, 'pin')}
                      className={`${btn} border border-rose/25 text-rose-dark hover:bg-blush`}
                    >
                      {r.is_pinned ? 'إلغاء التثبيت' : '📌 تثبيت'}
                    </button>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => window.confirm('حذف هذا التقييم نهائياً؟') && run(r, 'delete')}
                    className={`${btn} ms-auto border border-red-300 text-red-700 hover:bg-red-50`}
                  >
                    حذف
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReviewsQueue
