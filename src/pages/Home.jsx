import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col items-center text-center gap-6">
      <motion.img
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="/logo.jpeg"
        alt="لولو كوزمتكس"
        className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-lg"
      />
      <motion.h1
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl font-extrabold text-rose-dark"
      >
        لولو كوزمتكس - Lolo Cosmetics
      </motion.h1>
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl md:text-2xl"
      >
        إطلالتك اليومية تبدأ من هنا ✨
      </motion.p>
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg md:text-xl text-taupe"
      >
        جودة عالية | عناية فاخرة | أسعار مناسبة — توصيل للضفة والقدس
      </motion.p>
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
        <Link
          to="/products"
          className="inline-block rounded-full bg-rose-dark px-8 py-3 text-cream font-bold shadow-md hover:bg-rose transition-colors"
        >
          اكتشف منتجاتنا
        </Link>
      </motion.div>
      <p className="mt-8 text-xs text-taupe/70">
        (الواجهة المتحركة الكاملة قادمة في المرحلة الثالثة 🎬)
      </p>
    </section>
  )
}

export default Home
