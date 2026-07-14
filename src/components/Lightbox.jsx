import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Shared fullscreen image viewer with click-to-zoom.
// index: current image index, or -1 when closed. Used by the storefront gallery AND the
// admin image manager. NOTE: deliberately not wrapped in AnimatePresence — the exit
// animation gets stuck inside transformed ancestors and the overlay never unmounts.
function Lightbox({ images, index, onClose, onIndexChange, alt = '' }) {
  const [zoom, setZoom] = useState(false)

  useEffect(() => setZoom(false), [index])

  useEffect(() => {
    if (index < 0) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % images.length)
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, onIndexChange])

  if (index < 0 || images.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-charcoal/90 overflow-auto"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
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
              onIndexChange((index - 1 + images.length) % images.length)
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
              onIndexChange((index + 1) % images.length)
            }}
            className="fixed end-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-charcoal text-2xl leading-none hover:bg-white"
          >
            ›
          </button>
        </>
      )}

      <div className="min-h-full flex items-center justify-center p-4">
        <img
          src={images[index]}
          alt={alt}
          onClick={(e) => {
            e.stopPropagation()
            setZoom((z) => !z)
          }}
          className={
            zoom ? 'max-w-none cursor-zoom-out' : 'max-h-[88vh] max-w-[92vw] object-contain cursor-zoom-in'
          }
        />
      </div>
    </motion.div>
  )
}

export default Lightbox
