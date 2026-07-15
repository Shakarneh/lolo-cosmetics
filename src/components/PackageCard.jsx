import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function PackageCard({ pkg, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay: (index % 4) * 0.06, ease: 'easeOut' },
      }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      whileHover={{ y: -4, transition: { duration: 0.18, delay: 0 } }}
      className="group rounded-2xl bg-white border border-rose/15 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200"
    >
      <Link to={`/package/${pkg.id}`} className="block relative">
        <span className="absolute top-2 start-2 z-10 rounded-full bg-rose px-2.5 py-0.5 text-[11px] font-bold text-white">
          {pkg.items.length} منتج
        </span>
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.nameAr}
            loading="lazy"
            className="aspect-square w-full object-contain bg-white p-2"
          />
        ) : (
          <div className="aspect-square w-full bg-blush/50 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
            🎁
          </div>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link
          to={`/package/${pkg.id}`}
          className="text-sm font-medium leading-snug hover:text-rose-dark transition-colors line-clamp-2"
        >
          {pkg.nameAr}
        </Link>
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <span className={`font-bold text-rose-dark ${pkg.price != null ? 'text-base' : 'text-xs'}`}>
            {pkg.price != null ? `${pkg.price} ₪` : 'تواصل معنا للسعر'}
          </span>
          <Link
            to={`/package/${pkg.id}`}
            className="inline-flex items-center justify-center rounded-full bg-rose px-3 py-2 text-sm font-bold text-white hover:bg-rose-dark transition-colors w-full"
          >
            عرض البكج
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default PackageCard
