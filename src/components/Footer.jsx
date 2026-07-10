import { WhatsAppIcon, InstagramIcon, SnapchatIcon, FacebookIcon } from './icons.jsx'
import { generalWhatsappLink } from '../lib/whatsapp.js'
import { socials } from '../data/socials.js'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

const socialBtn =
  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold hover:opacity-90 transition-opacity'

function Footer() {
  return (
    <footer className="mt-16 border-t border-rose/20 bg-blush/40">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col items-center gap-4 text-center">
        <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-14 h-14 rounded-full" />
        <p className="text-base text-taupe">
          إطلالتك اليومية تبدأ من هنا — جودة عالية | عناية فاخرة | أسعار مناسبة
        </p>
        <p className="text-base text-taupe">توصيل للضفة والقدس 🚚</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={generalWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            className={`${socialBtn} bg-[#25D366] text-white`}
          >
            <WhatsAppIcon className="w-5 h-5" />
            واتساب
          </a>
          <a
            href={socials.instagram}
            target="_blank"
            rel="noreferrer"
            style={instagramGradient}
            className={`${socialBtn} text-white`}
          >
            <InstagramIcon className="w-5 h-5" />
            انستغرام
          </a>
          {socials.snapchat && (
            <a
              href={socials.snapchat}
              target="_blank"
              rel="noreferrer"
              className={`${socialBtn} bg-[#FFFC00] text-charcoal`}
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
              className={`${socialBtn} bg-[#1877F2] text-white`}
            >
              <FacebookIcon className="w-5 h-5" />
              فيسبوك
            </a>
          )}
        </div>
        <p className="text-sm text-taupe">© 2026 Lolo — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}

export default Footer
