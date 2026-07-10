import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { compressImage } from '../lib/compressImage.js'
import Reveal from './Reveal.jsx'

const MAX_PHOTOS = 3
const MAX_CHARS = 200

const inputClass =
  'w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition'

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
    setSubmitting(true)
    setError(null)

    // visitors can't read pending rows back (RLS), so the id is generated here
    const reviewId = crypto.randomUUID()
    const { error: insError } = await supabase.from('reviews').insert({
      id: reviewId,
      product_id: productId,
      customer_name: name.trim(),
      rating,
      body: body.trim(),
    })
    if (insError) {
      setSubmitting(false)
      setError('تعذّر إرسال التقييم — حاول مجدداً')
      return
    }

    // photos are best-effort: the review itself is already submitted
    let failedPhotos = false
    for (let i = 0; i < photos.length; i++) {
      try {
        const blob = await compressImage(photos[i])
        const path = `${reviewId}/${i}.webp`
        const { error: upError } = await supabase.storage
          .from('review-images')
          .upload(path, blob, { contentType: 'image/webp' })
        if (upError) throw upError
        const { error: imgError } = await supabase
          .from('review_images')
          .insert({ review_id: reviewId, storage_path: path, position: i })
        if (imgError) throw imgError
      } catch {
        failedPhotos = true
      }
    }
    setPhotoWarning(failedPhotos)
    setSubmitting(false)
    setDone(true)
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

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
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
