import { WhatsAppIcon, InstagramIcon } from '../components/icons.jsx'
import Reveal from '../components/Reveal.jsx'
import { generalWhatsappLink } from '../lib/whatsapp.js'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

function About() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center flex flex-col items-center gap-6">
      <Reveal>
        <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-28 h-28 rounded-full shadow-md" />
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="text-3xl md:text-4xl font-bold text-rose-dark">من نحن</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-lg md:text-xl leading-relaxed text-charcoal">
          لولو كوزمتكس — متجرك المفضل لمنتجات التجميل والعناية الشخصية.
          نختار لك منتجات بجودة عالية وأسعار مناسبة، لأن إطلالتك اليومية تبدأ من هنا.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="text-lg text-taupe">توصيل للضفة والقدس 🚚</p>
      </Reveal>
      <Reveal delay={0.4} className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={generalWhatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white text-lg font-bold hover:opacity-90 transition-opacity"
        >
          <WhatsAppIcon className="w-6 h-6" />
          تواصل معنا واتساب
        </a>
        <a
          href="https://instagram.com/lolo_cosmetice"
          target="_blank"
          rel="noreferrer"
          style={instagramGradient}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white text-lg font-bold hover:opacity-90 transition-opacity"
        >
          <InstagramIcon className="w-6 h-6" />
          تابعنا على انستغرام
        </a>
      </Reveal>
    </section>
  )
}

export default About
