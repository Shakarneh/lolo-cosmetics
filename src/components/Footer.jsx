import { WhatsAppIcon, InstagramIcon } from './icons.jsx'

const instagramGradient = {
  backgroundImage:
    'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-rose/20 bg-blush/40">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col items-center gap-4 text-center">
        <img src="/logo.jpeg" alt="لولو كوزمتكس" className="w-14 h-14 rounded-full" />
        <p className="text-base text-taupe">
          إطلالتك اليومية تبدأ من هنا — جودة عالية | عناية فاخرة | أسعار مناسبة
        </p>
        <p className="text-base text-taupe">توصيل للضفة والقدس 🚚</p>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/970593950074"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-5 h-5" />
            واتساب
          </a>
          <a
            href="https://instagram.com/lolo_cosmetice"
            target="_blank"
            rel="noreferrer"
            style={instagramGradient}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <InstagramIcon className="w-5 h-5" />
            انستغرام
          </a>
        </div>
        <p className="text-sm text-taupe">© 2026 Lolo — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}

export default Footer
