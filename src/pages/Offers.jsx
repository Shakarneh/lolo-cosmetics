function Offers() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-rose-dark mb-3 text-center">عروض وخصومات 🎁</h1>
      <p className="text-lg text-taupe mb-10 text-center">
        ترقبوا أقوى العروض والخصومات هنا قريبًا — سيتم ربط هذا القسم بالكتالوج في المرحلة الثانية.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-blush/60 border border-rose/15 animate-pulse"
          />
        ))}
      </div>
    </section>
  )
}

export default Offers
