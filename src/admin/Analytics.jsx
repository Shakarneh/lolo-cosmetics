import { useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useAnalytics } from './useAnalytics.js'
import { PRESETS, resolveRange, buildSeries, arNum } from './analyticsRange.js'
import { categoryNames } from '../data/categories.js'
import { useProducts } from '../hooks/useProducts.js'
import { usePackages } from '../hooks/usePackages.js'

// This page uses its own dark theme (owner request): near-black surfaces, green bars.
const GREEN = '#4ade80'
const GREEN_DARK = '#22c55e'

// Turn a raw route path into a human label the owner can read at a glance.
function pageLabel(path, productsById, packagesById) {
  const statics = {
    '/': 'الرئيسية',
    '/products': 'كل المنتجات',
    '/offers': 'عروض وخصومات',
    '/packages': 'البكجات',
    '/about': 'من نحن',
    '/contact': 'تواصل معنا',
    '/cart': 'السلة',
    '/search': 'البحث',
  }
  if (statics[path]) return statics[path]
  let m
  if ((m = path.match(/^\/products\/(.+)$/))) return `قسم: ${categoryNames[m[1]] ?? m[1]}`
  if ((m = path.match(/^\/product\/(.+)$/))) return `منتج: ${productsById[m[1]] ?? m[1]}`
  if ((m = path.match(/^\/package\/(.+)$/))) return `بكج: ${packagesById[m[1]] ?? m[1]}`
  return path
}

const fullDateFmt = new Intl.DateTimeFormat('ar-EG', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/10 p-5 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-neutral-400">{label}</span>
        <span className="text-4xl font-bold" style={{ color: GREEN }}>
          {arNum(value)}
        </span>
      </div>
    </div>
  )
}

function TrendChart({ series }) {
  const [hover, setHover] = useState(null)
  const { points } = series
  const max = Math.max(1, ...points.map((p) => p.views))
  const height = 170

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/10 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">اتجاه الزيارات</h2>
        <span className="text-sm text-neutral-400">
          أعلى قيمة: <span className="font-bold text-neutral-200">{arNum(max)}</span>
        </span>
      </div>

      {points.length === 0 ? (
        <p className="text-sm text-neutral-400 py-8 text-center">لا توجد بيانات في هذه الفترة.</p>
      ) : (
        <>
          <div className="relative flex items-end gap-1" style={{ height }}>
            {points.map((p, i) => {
              // zero-view buckets get NO bar at all — a forced minimum height here
              // used to render a row of tiny slivers that looked like a slider track.
              const barHeight = p.views === 0 ? 0 : Math.max(3, Math.round((p.views / max) * (height - 8)))
              const active = hover === i
              return (
                <div
                  key={p.key}
                  className="relative flex-1 min-w-[6px] h-full flex flex-col items-center justify-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                  tabIndex={0}
                  role="img"
                  aria-label={`${p.label}: ${p.views} زيارة`}
                >
                  {active && (
                    <div className="absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-black px-3 py-1.5 text-sm font-bold text-white border border-white/15 shadow-lg">
                      {arNum(p.views)} · {p.label}
                    </div>
                  )}
                  {/* faint baseline so an empty bucket is still visible/hoverable, without looking like a mark */}
                  <div className="absolute bottom-0 w-full h-px bg-white/10" />
                  {barHeight > 0 && (
                    <div
                      className="w-full max-w-[26px] rounded-t-[4px] transition-colors"
                      style={{ height: `${barHeight}px`, backgroundColor: active ? GREEN_DARK : GREEN }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>{points[0].label}</span>
            <span>{points[points.length - 1].label}</span>
          </div>
        </>
      )}
    </div>
  )
}

// Ranked horizontal-bar list. Deliberately NOT a rounded-full "pill" — that style
// reads as a slider/progress control the owner tried (and failed) to drag. A flat
// bar-chart-style row with a visible count makes it unmistakably a static chart.
function PageBreakdown({ pages, productsById, packagesById }) {
  const max = Math.max(1, ...pages.map((p) => p.views))

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/10 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">الزيارات حسب الصفحة</h2>
        <span className="text-sm text-neutral-400">{arNum(pages.length)} صفحة</span>
      </div>
      {pages.length === 0 ? (
        <p className="text-sm text-neutral-400">لا توجد بيانات في هذه الفترة.</p>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[26rem] overflow-y-auto pe-1">
          {pages.map((p) => (
            <div key={p.path} className="flex items-center gap-3">
              <span className="w-28 sm:w-52 shrink-0 text-xs text-neutral-200 truncate" title={p.path}>
                {pageLabel(p.path, productsById, packagesById)}
              </span>
              <div className="flex-1 h-3 rounded-sm bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${Math.max(3, (p.views / max) * 100)}%`, backgroundColor: GREEN }}
                />
              </div>
              <span className="w-12 shrink-0 text-end text-base font-bold text-white">{arNum(p.views)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Filters({ preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd }) {
  const chip = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
      active
        ? 'text-black border-transparent'
        : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
    }`
  const dateInput =
    'w-40 rounded-xl bg-neutral-800 border border-white/10 text-white px-3 py-2 outline-none focus:border-white/30 [color-scheme:dark]'

  return (
    <div className="rounded-2xl bg-neutral-900 border border-white/10 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPreset(p.key)}
            className={chip(preset === p.key)}
            style={preset === p.key ? { backgroundColor: GREEN } : undefined}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-300 pt-3 mt-1 border-t border-white/10">
          <span>من</span>
          <input
            type="date"
            dir="ltr"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className={dateInput}
          />
          <span>إلى</span>
          <input
            type="date"
            dir="ltr"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className={dateInput}
          />
        </div>
      )}
    </div>
  )
}

function Analytics() {
  const { profile } = useAuth()
  const [preset, setPreset] = useState('m1')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const range = useMemo(() => resolveRange(preset, customStart, customEnd), [preset, customStart, customEnd])
  const { data, loading, error, refetch } = useAnalytics(range?.startISO, range?.endISO)

  // readable page names — cached hooks, only loaded here for the owner
  const { products } = useProducts()
  const { packages } = usePackages()
  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p.nameAr])), [products])
  const packagesById = useMemo(() => Object.fromEntries(packages.map((p) => [p.id, p.nameAr])), [packages])

  // owner-only (RLS enforces server-side too)
  if (profile.role !== 'owner') {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-3">
        <span className="text-5xl">🔒</span>
        <p className="text-xl font-medium">هذه الشاشة للمالك فقط</p>
      </div>
    )
  }

  const series = data && range ? buildSeries(data.daily, range.startDate, range.endDate) : null
  const totalViews = data ? data.daily.reduce((s, d) => s + d.views, 0) : 0
  const spanDays = range ? Math.round((range.endDate - range.startDate) / 86400000) + 1 : 1
  const avgDaily = data ? Math.round(totalViews / Math.max(1, spanDays)) : 0
  const peakDay = data ? Math.max(0, ...data.daily.map((d) => d.views)) : 0

  const rangeSummary = range
    ? spanDays === 1
      ? fullDateFmt.format(range.startDate)
      : `${fullDateFmt.format(range.startDate)} — ${fullDateFmt.format(range.endDate)}`
    : null

  return (
    <div className="rounded-3xl bg-neutral-950 text-neutral-100 p-5 md:p-7 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white">الإحصائيات</h1>
        {rangeSummary && <p className="text-sm text-neutral-400 mt-1">{rangeSummary}</p>}
      </div>

      <Filters
        preset={preset}
        setPreset={setPreset}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
      />

      {preset === 'custom' && !range ? (
        <p className="rounded-2xl bg-neutral-900 border border-white/10 p-6 text-sm text-neutral-400">
          اختر تاريخ بداية ونهاية صحيحين لعرض البيانات.
        </p>
      ) : loading ? (
        <div className="py-24 flex justify-center">
          <span className="h-10 w-10 rounded-full border-4 border-white/15 border-t-emerald-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-neutral-900 border border-white/10 p-8 flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-lg text-white">تعذّر تحميل الإحصائيات</p>
          <button onClick={refetch} className="rounded-full px-6 py-2 font-bold text-black" style={{ backgroundColor: GREEN }}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile icon="👁️" label="إجمالي الزيارات" value={totalViews} />
            <StatTile icon="📅" label="متوسط يومي" value={avgDaily} />
            <StatTile icon="🔝" label="أعلى يوم" value={peakDay} />
          </div>
          <TrendChart series={series} />
          <PageBreakdown pages={data.pages} productsById={productsById} packagesById={packagesById} />
        </>
      )}
    </div>
  )
}

export default Analytics
