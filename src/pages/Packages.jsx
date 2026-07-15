import PackageCard from '../components/PackageCard.jsx'
import Reveal from '../components/Reveal.jsx'
import DataStatus from '../components/DataStatus.jsx'
import { usePackages } from '../hooks/usePackages.js'

function Packages() {
  const { packages, loading, error, refetch } = usePackages()

  if (loading || error) return <DataStatus error={error} onRetry={refetch} label="البكجات" />

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-bold text-rose-dark mb-3 text-center">البكجات 🎁</h1>
      </Reveal>
      {packages.length === 0 ? (
        <Reveal delay={0.15}>
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <span className="text-6xl">🎁</span>
            <p className="text-xl text-charcoal font-medium">لا توجد بكجات حالياً</p>
            <p className="text-lg text-taupe">ترقبوا بكجات مميزة قريباً!</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {packages.map((p, i) => (
            <PackageCard key={p.id} pkg={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Packages
