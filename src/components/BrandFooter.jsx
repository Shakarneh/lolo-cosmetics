import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { generalWhatsappLink } from '../lib/whatsapp.js'
import { socials } from '../data/socials.js'
import { WhatsAppIcon, InstagramIcon, SnapchatIcon, FacebookIcon } from './icons.jsx'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

const socialBtn =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold text-white shadow-sm hover:opacity-90 transition-opacity'

// Unified closing banner + footer (owner's photo): model on the RIGHT, brand text
// centered over the cream area on the LEFT with the social links beside it, copyright
// printed directly on the image. Replaces the old BrandStrip + Footer pair. Rendered at
// the very bottom of the page so the photo runs down to the page edge.
function BrandFooter() {
  const [failed, setFailed] = useState(false)
  const { pathname } = useLocation()
  const hideSocials = pathname === '/about' || pathname === '/contact'

  return (
    <footer className="relative overflow-hidden">
      {!failed && (
        <img
          src="/images/all-products-strip.webp"
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-[85%_25%]"
        />
      )}
      {/* readability washes over the left content (+ cream fallback if the photo fails) */}
      <div className="absolute inset-0 bg-cream/55 md:bg-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cream to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 min-h-[30rem] md:min-h-[34rem] py-12 flex flex-col justify-between gap-8">
        {/* main content pinned to the physical LEFT (justify-end in RTL) */}
        <div className="flex-1 flex items-center justify-end">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
            {/* brand text — centered (sits to the RIGHT of the social links in RTL) */}
            <div className="order-1 flex flex-col items-center text-center gap-3">
              <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-16 h-16 rounded-full shadow-sm" />
              <p className="text-3xl md:text-4xl font-bold text-rose-dark leading-relaxed">
                إطلالتك اليومية تبدأ من هنا 🌸
              </p>
              <p className="text-base md:text-lg text-taupe">جودة عالية · عناية فاخرة · أسعار مناسبة</p>
              <p className="text-base md:text-lg text-taupe">توصيل للضفة والقدس 🚚</p>
            </div>
            {/* social links — on the physical LEFT (order-2 = end = left in RTL);
                hidden on About/Contact since those pages already have their own social buttons */}
            {!hideSocials && (
              <div className="order-2 flex flex-wrap items-center justify-center gap-3 md:w-52 md:flex-col md:flex-nowrap md:items-stretch">
                <a
                  href={generalWhatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className={`${socialBtn} bg-[#25D366]`}
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  واتساب
                </a>
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  style={instagramGradient}
                  className={socialBtn}
                >
                  <InstagramIcon className="w-5 h-5" />
                  انستغرام
                </a>
                {socials.snapchat && (
                  <a
                    href={socials.snapchat}
                    target="_blank"
                    rel="noreferrer"
                    className={`${socialBtn} bg-[#FFFC00] !text-charcoal`}
                  >
                    <SnapchatIcon className="w-5 h-5" />
                    سناب شات
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className={`${socialBtn} bg-[#1877F2]`}
                  >
                    <FacebookIcon className="w-5 h-5" />
                    فيسبوك
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* copyright — printed directly on the banner, larger & clearer */}
        <p className="text-center text-base md:text-lg font-medium text-charcoal/80">
          © 2026 Lolo — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  )
}

export default BrandFooter
