import { supabase } from '../lib/supabase.js'
import Stars from './Stars.jsx'
import Reveal from './Reveal.jsx'

const dateFormat = new Intl.DateTimeFormat('ar', { dateStyle: 'medium' })

function reviewImageUrl(path) {
  return supabase.storage.from('review-images').getPublicUrl(path).data.publicUrl
}

// The whole section disappears when there are no approved reviews — user's explicit UX rule.
function ProductReviews({ reviews }) {
  if (!reviews.length) return null

  return (
    <section className="mx-auto max-w-5xl px-4 pb-14">
      <Reveal>
        <h2 className="text-2xl font-bold text-rose-dark mb-5">آراء الزبائن ({reviews.length})</h2>
      </Reveal>
      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={(i % 2) * 0.08}>
            <div className="h-full rounded-2xl bg-white border border-rose/15 p-5 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Stars rating={r.rating} />
                <span className="font-medium">{r.customer_name}</span>
                <span className="ms-auto text-xs text-taupe">{dateFormat.format(new Date(r.created_at))}</span>
              </div>
              <p className="leading-relaxed text-charcoal">{r.body}</p>
              {(r.review_images ?? []).length > 0 && (
                <div className="flex gap-2 pt-1">
                  {r.review_images.map((img) => (
                    <a
                      key={img.storage_path}
                      href={reviewImageUrl(img.storage_path)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={reviewImageUrl(img.storage_path)}
                        alt=""
                        loading="lazy"
                        className="w-16 h-16 rounded-lg object-cover border border-rose/15"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default ProductReviews
