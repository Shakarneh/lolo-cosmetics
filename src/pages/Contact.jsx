import { WhatsAppIcon, InstagramIcon, SnapchatIcon, FacebookIcon } from '../components/icons.jsx'
import Reveal from '../components/Reveal.jsx'
import { generalWhatsappLink } from '../lib/whatsapp.js'
import { socials } from '../data/socials.js'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

const socialBtn =
  'inline-flex items-center gap-2 rounded-full px-6 py-3 text-lg font-bold hover:opacity-90 transition-opacity'

function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center flex flex-col items-center gap-6">
      <Reveal>
        <h1 className="text-3xl md:text-4xl font-bold text-rose-dark">تواصل معنا 💬</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-lg md:text-xl leading-relaxed text-charcoal">
          للطلب أو الاستفسار عن أي منتج، راسلنا على واتساب — نرد بأسرع وقت.
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <a
          href={generalWhatsappLink()}
          target="_blank"
          rel="noreferrer"
          className={`${socialBtn} bg-[#25D366] px-10 py-4 text-white text-xl`}
        >
          <WhatsAppIcon className="w-7 h-7" />
          راسلنا على واتساب
        </a>
      </Reveal>

      <Reveal delay={0.3} className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={socials.instagram}
          target="_blank"
          rel="noreferrer"
          style={instagramGradient}
          className={`${socialBtn} text-white`}
        >
          <InstagramIcon className="w-6 h-6" />
          انستغرام
        </a>
        {socials.snapchat && (
          <a
            href={socials.snapchat}
            target="_blank"
            rel="noreferrer"
            className={`${socialBtn} bg-[#FFFC00] text-charcoal`}
          >
            <SnapchatIcon className="w-6 h-6" />
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
            <FacebookIcon className="w-6 h-6" />
            فيسبوك
          </a>
        )}
      </Reveal>

      <Reveal delay={0.4}>
        <div className="rounded-2xl bg-white border border-rose/15 px-8 py-6 flex flex-col gap-2">
          <p className="text-lg font-bold text-rose-dark">التوصيل 🚚</p>
          <p className="text-base text-charcoal">نوصل طلباتكم لكل مناطق الضفة والقدس.</p>
          <p className="text-base text-taupe">التفاصيل والتكلفة حسب المنطقة.</p>
        </div>
      </Reveal>
    </section>
  )
}

export default Contact
