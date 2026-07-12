import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function ProductGallery({ images, alt }) {
  const [active, setActive] = useState(0)

  useEffect(() => setActive(0), [images])

  const current = images[Math.min(active, images.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl overflow-hidden border border-rose/15 bg-white">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="aspect-square w-full object-contain p-4"
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
    </div>
  )
}

export default ProductGallery
