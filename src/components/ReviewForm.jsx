import { useEffect, useRef, useState } from 'react'
import { compressImage } from '../lib/compressImage.js'
import Reveal from './Reveal.jsx'

const MAX_PHOTOS = 3
const MAX_CHARS = 200

// Turnstile site key — public by design (domain-bound). The secret key
// lives ONLY in the Supabase Edge Function's secrets.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

const inputClass =
  'w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition'

// loads the Turnstile script once, shared across mounts
function loadTurnstile() {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve(window.turnstile)
    const existing = document.getElementById('cf-turnstile-script')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile))
      return
    }
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve(window.turnstile)
    document.head.appendChild(script)
  })
}

function ReviewForm({ productId }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState([]) // File[]
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [photoWarning, setPhotoWarning] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState('')
  const widgetRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let cancelled = false
    loadTurnstile().then((turnstile) => {
      if (cancelled || !turnstile || !widgetRef.current || widgetIdRef.current !== null) return
      widgetIdRef.current = turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        language: 'ar',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      })
    })
    return () => {
      cancelled = true
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  function handlePhotos(e) {
    const files = [...e.target.files]
    e.target.value = ''
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('اختر عدد النجوم أولاً')
      return
    }
    if (!token) {
      setError('يرجى الانتظار لحظة حتى يكتمل التحقق الأمني ثم أعد المحاولة')
      return
    }
    setSubmitting(true)
    setError(null)

    // photos are compressed here so the function receives small webp files
    const formData = new FormData()
    formData.append('token', token)
    formData.append('product_id', productId)
    formData.append('customer_name', name.trim())
    formData.append('rating', String(rating))
    formData.append('body', body.trim())
    for (let i = 0; i < photos.length; i++) {
      try {
        const blob = await compressImage(photos[i])
        formData.append(`photo${i}`, blob, `${i}.webp`)
      } catch {
        // unsupported file — the review still goes through without it
      }
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-review`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'request failed')
      setPhotoWarning(!!data.photoFailed)
      setDone(true)
    } catch {
      setError('تعذّر إرسال التقييم — حاول مجدداً')
      // a used token can't be verified twice — get a fresh one for the retry
      if (widgetIdRef.current !== null && window.turnstile) {
        setToken('')
        window.turnstile.reset(widgetIdRef.current)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white border border-rose/15 p-8 text-center flex flex-col items-center gap-2">
        <span className="text-4xl">🌸</span>
        <p className="text-lg font-bold text-rose-dark">شكراً لك!</p>
        <p className="text-taupe">تقييمك وصلنا وسيظهر على الموقع بعد موافقة المتجر.</p>
        {photoWarning && (
          <p className="text-sm text-amber-700">ملاحظة: تعذّر رفع بعض الصور، لكن التقييم نفسه وصل.</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-rose-dark">أضف تقييمك ✍️</h2>

      <div className="flex items-center gap-2">
        <div dir="ltr" className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${star} من 5`}
              className={`text-3xl transition-colors ${
                star <= (hovered || rating) ? 'text-amber-500' : 'text-charcoal/20'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && <span className="text-sm text-taupe">{rating} من 5</span>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">اسمك *</span>
          <input
            type="text"
            required
            minLength={2}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            تقييمك * <span className="text-xs text-taupe">({body.length}/{MAX_CHARS})</span>
          </span>
          <textarea
            required
            rows={3}
            maxLength={MAX_CHARS}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {photos.map((file, i) => (
          <div key={`${file.name}-${i}`} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border border-rose/15"
            />
            <button
              type="button"
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              aria-label="إزالة الصورة"
              className="absolute -top-1.5 -start-1.5 w-5 h-5 rounded-full bg-charcoal text-white text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-rose/30 flex flex-col items-center justify-center text-taupe hover:border-rose hover:text-rose-dark transition-colors cursor-pointer">
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px]">صور ({photos.length}/{MAX_PHOTOS})</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          </label>
        )}
      </div>

      {/* invisible for most visitors — shows a checkbox only on suspicion */}
      {TURNSTILE_SITE_KEY ? (
        <div ref={widgetRef} />
      ) : (
        <p className="text-sm text-amber-700">
          نموذج التقييم غير مُفعّل (مفتاح التحقق الأمني غير مضبوط)
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !TURNSTILE_SITE_KEY}
        className="self-start rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors disabled:opacity-60"
      >
        {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  )
}

function ReviewFormSection({ productId }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14">
      <Reveal>
        <ReviewForm productId={productId} />
      </Reveal>
    </section>
  )
}

export default ReviewFormSection
