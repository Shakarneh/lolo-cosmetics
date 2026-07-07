import { motion } from 'framer-motion'

// غلاف موحّد لأنيميشن الظهور عند التمرير — استخدمه حول أي قسم يحتاج scroll reveal
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
