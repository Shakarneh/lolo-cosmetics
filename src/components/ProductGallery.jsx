import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Gallery for a product's media: an optional video (shown first) + images.
// Images open in a fullscreen zoomable lightbox; the video plays inline with controls.
function ProductGallery({ images, alt, video = null }) {
  const slides = [
    ...(video ? [{ type: 'video', src: video }] : []),
    ...images.map((src) => ({ type: 'image', src })),
  ]

  const [active, setActive] = useState(0)
  const [lb, setLb] = useState(-1) // lightbox image index, -1 = closed
  const [zoom, setZoom] = useState(false)

  useEffect(() => setActive(0), [images, video])
  useEffect(() => setZoom(false), [lb])

  // keyboard controls while the lightbox is open (images only)
  useEffect(() => {
    if (lb < 0) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLb(-1)
      else if (e.key === 'ArrowRight') setLb((i) => (i + 1) % images.length)
      else if (e.key === 'ArrowLeft') setLb((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lb, images.length])

  const current = slides[Math.min(active, slides.length - 1)]

  function openLightbox() {
    if (current.type !== 'image') return
    const idx = images.indexOf(current.src)
    setLb(idx < 0 ? 0 : idx)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
        {current.type === 'video' ? (
          <video
            src={current.src}
            controls
            playsInline
            className="aspect-square w-full object-contain bg-black"
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={current.src}
              src={current.src}
              alt={alt}
              onClick={openLightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="aspect-square w-full object-contain p-4 cursor-zoom-in"
            />
          </AnimatePresence>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((s, i) => (
            <button
              key={`${s.type}-${s.src}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={s.type === 'video' ? 'الفيديو' : `صورة ${i + 1}`}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                i === active ? 'border-rose' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {s.type === 'video' ? (
                <span className="flex w-full h-full items-center justify-center bg-charcoal/80 text-white text-xl">
                  ▶
                </span>
              ) : (
                <img src={s.src} alt="" loading="lazy" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* fullscreen lightbox with click-to-zoom (images only) */}
      {lb >= 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setLb(-1)}
          className="fixed inset-0 z-[100] bg-charcoal/90 overflow-auto"
        >
          <button
            type="button"
            aria-label="إغلاق"
            onClick={(e) => {
              e.stopPropagation()
              setLb(-1)
            }}
            className="fixed top-4 end-4 z-10 w-10 h-10 rounded-full bg-white/90 text-charcoal text-2xl leading-none hover:bg-white"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="السابق"
                onClick={(e) => {
                  e.stopPropagation()
                  setLb((i) => (i - 1 + images.length) % images.length)
                }}
                className="fixed start-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-charcoal text-2xl leading-none hover:bg-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="التالي"
                onClick={(e) => {
                  e.stopPropagation()
                  setLb((i) => (i + 1) % images.length)
                }}
                className="fixed end-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-charcoal text-2xl leading-none hover:bg-white"
              >
                ›
              </button>
            </>
          )}

          <div className="min-h-full flex items-center justify-center p-4">
            <img
              src={images[lb]}
              alt={alt}
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => !z)
              }}
              className={
                zoom
                  ? 'max-w-none cursor-zoom-out'
                  : 'max-h-[88vh] max-w-[92vw] object-contain cursor-zoom-in'
              }
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProductGallery
