import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function ProductGallery({ images, alt }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(false)

  useEffect(() => setActive(0), [images])
  useEffect(() => setZoom(false), [active, open])

  // keyboard controls while the lightbox is open
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      else if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length)
      else if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images.length])

  const current = images[Math.min(active, images.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt={alt}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="aspect-square w-full object-contain p-4 cursor-zoom-in"
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`صورة ${i + 1}`}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                i === active ? 'border-rose' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* fullscreen lightbox with click-to-zoom */}
      {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-charcoal/90 overflow-auto"
          >
            <button
              type="button"
              aria-label="إغلاق"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
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
                    setActive((i) => (i - 1 + images.length) % images.length)
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
                    setActive((i) => (i + 1) % images.length)
                  }}
                  className="fixed end-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-charcoal text-2xl leading-none hover:bg-white"
                >
                  ›
                </button>
              </>
            )}

            <div className="min-h-full flex items-center justify-center p-4">
              <img
                src={current}
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
