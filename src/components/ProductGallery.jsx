import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Lightbox from './Lightbox.jsx'

// Gallery for a product's media: an optional video + images.
// Images open in a fullscreen zoomable lightbox; the video plays inline with controls.
function ProductGallery({ images, alt, video = null, videoFirst = true }) {
  const imageSlides = images.map((src) => ({ type: 'image', src }))
  const videoSlide = video ? [{ type: 'video', src: video }] : []
  // video first, or main image first with the video after the images
  const slides = videoFirst ? [...videoSlide, ...imageSlides] : [...imageSlides, ...videoSlide]

  const [active, setActive] = useState(0)
  const [lb, setLb] = useState(-1) // lightbox image index, -1 = closed

  useEffect(() => setActive(0), [images, video])

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

      <Lightbox images={images} index={lb} onClose={() => setLb(-1)} onIndexChange={setLb} alt={alt} />
    </div>
  )
}

export default ProductGallery
