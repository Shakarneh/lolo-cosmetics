function DataStatus({ error, onRetry, label = 'المنتجات' }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 flex flex-col items-center gap-4 text-center">
      {error ? (
        <>
          <span className="text-5xl">⚠️</span>
          <p className="text-xl font-medium text-charcoal">تعذّر تحميل {label}</p>
          <p className="text-base text-taupe">تأكد من اتصالك بالإنترنت ثم حاول مجدداً</p>
          <button
            onClick={onRetry}
            className="mt-2 rounded-full bg-rose px-8 py-2.5 text-white font-bold hover:bg-rose-dark transition-colors"
          >
            إعادة المحاولة
          </button>
        </>
      ) : (
        <>
          <span className="h-10 w-10 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
          <p className="text-lg text-taupe">جاري تحميل {label}...</p>
        </>
      )}
    </section>
  )
}

export default DataStatus
