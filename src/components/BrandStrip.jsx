import { useState } from 'react'
import { generalWhatsappLink } from '../lib/whatsapp.js'
import { WhatsAppIcon } from './icons.jsx'

// Closing brand strip (owner's photo): model on the RIGHT, tagline + WhatsApp CTA
// over the empty pink area on the LEFT (justify-end = physical left in RTL).
// Used on the Home page and all products pages, always right above the footer.
function BrandStrip() {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <div className="relative overflow-hidden">
      <img
        src="/images/all-products-strip.png"
        alt=""
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover object-[85%_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cream/85 via-cream/30 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cream to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 h-72 md:h-96 flex items-center justify-end">
        <div className="max-w-xs md:max-w-sm flex flex-col items-center text-center gap-4">
          <p className="text-2xl md:text-3xl font-bold text-rose-dark leading-relaxed">
            إطلالتك اليومية تبدأ من هنا 🌸
          </p>
          <p className="text-base md:text-lg text-taupe">جودة عالية · عناية فاخرة · أسعار مناسبة</p>
          <a
            href={generalWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-5 h-5" />
            تواصل معنا
          </a>
        </div>
      </div>
    </div>
  )
}

export default BrandStrip
