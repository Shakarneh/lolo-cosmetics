import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'

const features = [
  { emoji: '💎', title: 'جودة عالية', text: 'منتجات أصلية مختارة بعناية من أفضل الماركات' },
  { emoji: '🌸', title: 'عناية فاخرة', text: 'كل ما تحتاجه لروتين عنايتك اليومي بالبشرة والجسم' },
  { emoji: '💰', title: 'أسعار مناسبة', text: 'أسعار تناسب الجميع دون مساومة على الجودة' },
]

function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14 flex flex-col gap-10">
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.12}>
              <div className="h-full rounded-2xl bg-white border border-rose/15 p-6 text-center flex flex-col items-center gap-2 hover:shadow-lg transition-shadow duration-200">
                <span className="text-4xl">{f.emoji}</span>
                <h2 className="text-xl font-bold text-rose-dark">{f.title}</h2>
                <p className="text-base text-taupe leading-relaxed">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center text-lg md:text-xl text-taupe">توصيل للضفة والقدس 🚚</p>
        </Reveal>
      </section>
    </>
  )
}

export default Home
