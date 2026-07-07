import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
}

function Hero() {
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const layerRef = useRef(null)
  const reduceMotion = useReducedMotion()
  // الموبايل يحمّل نسخة 720p الخفيفة (1MB)، والشاشات الكبيرة نسخة 1080p المحسّنة
  const [videoSrc] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches ? '/videos/hero-1080.mp4' : '/videos/hero.mp4'
  )

  // طبقة البارالاكس التفاعلية — الفيديو والعناصر العائمة تتبع حركة الماوس بنعومة
  useEffect(() => {
    if (reduceMotion) return
    const root = rootRef.current
    const videoX = gsap.quickTo(videoRef.current, 'x', { duration: 0.9, ease: 'power3.out' })
    const videoY = gsap.quickTo(videoRef.current, 'y', { duration: 0.9, ease: 'power3.out' })
    const floats = Array.from(layerRef.current.querySelectorAll('[data-depth]')).map((el) => ({
      depth: Number(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
    }))

    const onMove = (e) => {
      const r = root.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      videoX(nx * -16)
      videoY(ny * -6)
      floats.forEach((f) => {
        f.x(nx * 46 * f.depth)
        f.y(ny * 34 * f.depth)
      })
    }

    root.addEventListener('mousemove', onMove)
    return () => root.removeEventListener('mousemove', onMove)
  }, [reduceMotion])

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden h-[74vh] min-h-[500px] max-h-[820px] bg-cream"
    >
      {/* فيديو الخلفية — مكبَّر قليلاً حتى لا تظهر الحواف أثناء البارالاكس */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover origin-top scale-100 md:scale-[1.07] [object-position:10%_top] md:[object-position:center_top]"
      />

      {/* تدرجات الدمج مع خلفية الصفحة + وضوح النص */}
      <div className="absolute inset-0 bg-gradient-to-l from-cream/80 via-cream/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 md:h-28 bg-gradient-to-t from-cream via-cream/80 md:via-transparent to-transparent" />

      {/* لمعة ضوء تمسح المشهد دورياً */}
      <div className="hero-sweep absolute inset-0 pointer-events-none" />

      {/* عناصر عائمة تتفاعل مع الماوس */}
      <div ref={layerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span
          data-depth="1"
          className="absolute top-[16%] start-[14%] w-28 h-28 rounded-full bg-rose/25 blur-2xl"
        />
        <span
          data-depth="0.6"
          className="absolute bottom-[22%] start-[34%] w-20 h-20 rounded-full bg-rose-dark/15 blur-xl"
        />
        <span
          data-depth="1.5"
          className="absolute top-[28%] start-[42%] w-3 h-3 rounded-full bg-white/70 blur-[2px]"
        />
        <span data-depth="1.2" className="absolute top-[20%] start-[38%] text-2xl opacity-60">
          ✨
        </span>
        <span data-depth="0.8" className="absolute bottom-[30%] start-[10%] text-xl opacity-50">
          ✨
        </span>
      </div>

      {/* المحتوى — على الجهة اليمنى فوق المساحة الفارغة في الفيديو */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 h-full flex items-end md:items-center pb-10 md:pb-0">
        <div className="me-auto w-full md:w-1/2 text-center md:text-start flex flex-col items-center md:items-start gap-3 md:gap-4">
          <motion.span
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif tracking-[0.35em] text-taupe text-sm md:text-base"
          >
            LOLO COSMETICS
          </motion.span>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold text-rose-dark leading-tight"
          >
            لولو كوزمتكس
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl text-charcoal"
          >
            إطلالتك اليومية تبدأ من هنا ✨
          </motion.p>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base md:text-lg text-taupe"
          >
            جودة عالية | عناية فاخرة | أسعار مناسبة
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3"
          >
            <Link
              to="/products"
              className="inline-block rounded-full bg-rose-dark px-8 py-3.5 text-cream text-lg font-bold shadow-md hover:bg-rose transition-colors"
            >
              اكتشف منتجاتنا
            </Link>
            <Link
              to="/offers"
              className="inline-block rounded-full border-2 border-rose-dark/60 px-8 py-3 text-rose-dark text-lg font-bold hover:bg-rose-dark hover:text-cream transition-colors"
            >
              عروض وخصومات
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
