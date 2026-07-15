// Date-range + bucketing helpers for the analytics dashboard.
// All day math is done in UTC to match the page_views_daily_range function,
// whose `day` comes from date_trunc('day', viewed_at) in the DB's UTC session.

const DAY_MS = 86400000

// "Arabic numerals" = the standard 0-9 digits (their actual English name) — NOT the
// Eastern Arabic-Indic ٠١٢٣٤٥٦٧٨٩ glyphs. Force 'en-US' so digits render 0-9 regardless
// of the page's ar-EG locale, with thousands separators for readability.
const arNumFmt = new Intl.NumberFormat('en-US')
export function arNum(n) {
  return arNumFmt.format(n)
}

export const PRESETS = [
  { key: 'today', label: 'اليوم' },
  { key: 'yesterday', label: 'أمس' },
  { key: 'm1', label: 'آخر شهر', months: 1 },
  { key: 'm3', label: 'آخر 3 أشهر', months: 3 },
  { key: 'm5', label: 'آخر 5 أشهر', months: 5 },
  { key: 'y1', label: 'آخر سنة', months: 12 },
  { key: 'custom', label: 'نطاق مخصص' },
]

function startOfUTCDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function utcKey(d) {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

// Resolve the active {startISO, endISO (exclusive), startDate, endDate} from either
// a months preset or an explicit custom start/end (inclusive YYYY-MM-DD strings).
export function resolveRange(preset, customStart, customEnd) {
  const todayStart = startOfUTCDay(new Date())
  const endExclusive = new Date(todayStart.getTime() + DAY_MS) // include all of today

  if (preset === 'custom') {
    if (!customStart || !customEnd) return null
    const start = new Date(`${customStart}T00:00:00Z`)
    const endIncl = new Date(`${customEnd}T00:00:00Z`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(endIncl.getTime())) return null
    if (start > endIncl) return null
    const endExcl = new Date(endIncl.getTime() + DAY_MS)
    return { startISO: start.toISOString(), endISO: endExcl.toISOString(), startDate: start, endDate: endIncl }
  }

  if (preset === 'today') {
    return { startISO: todayStart.toISOString(), endISO: endExclusive.toISOString(), startDate: todayStart, endDate: todayStart }
  }

  if (preset === 'yesterday') {
    const yStart = new Date(todayStart.getTime() - DAY_MS)
    return { startISO: yStart.toISOString(), endISO: todayStart.toISOString(), startDate: yStart, endDate: yStart }
  }

  const p = PRESETS.find((x) => x.key === preset) ?? PRESETS[0]
  const start = new Date(endExclusive)
  start.setUTCMonth(start.getUTCMonth() - p.months)
  return {
    startISO: start.toISOString(),
    endISO: endExclusive.toISOString(),
    startDate: start,
    endDate: new Date(endExclusive.getTime() - DAY_MS),
  }
}

const dayLabelFmt = new Intl.DateTimeFormat('ar-EG', { timeZone: 'UTC', day: 'numeric', month: 'short' })
const monthLabelFmt = new Intl.DateTimeFormat('ar-EG', { timeZone: 'UTC', month: 'short', year: '2-digit' })

export function formatDayKey(key) {
  return dayLabelFmt.format(new Date(`${key}T00:00:00Z`))
}

// Turn sparse daily rows into evenly-spaced buckets across [startDate, endDate].
// Granularity scales with the span so a year doesn't render 365 bars:
//   ≤ 35 days → daily · ≤ 168 days → weekly (7-day) · else → monthly.
export function buildSeries(dailyRows, startDate, endDate) {
  const byDay = Object.fromEntries(dailyRows.map((r) => [r.day, r.views]))
  const start = startOfUTCDay(startDate)
  const end = startOfUTCDay(endDate)
  const spanDays = Math.round((end - start) / DAY_MS) + 1
  const granularity = spanDays <= 35 ? 'day' : spanDays <= 168 ? 'week' : 'month'

  const points = []

  if (granularity === 'month') {
    let cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
    const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1))
    while (cur <= last) {
      const y = cur.getUTCFullYear()
      const m = cur.getUTCMonth()
      let views = 0
      for (const [key, v] of Object.entries(byDay)) {
        const d = new Date(`${key}T00:00:00Z`)
        if (d.getUTCFullYear() === y && d.getUTCMonth() === m) views += v
      }
      points.push({ key: utcKey(cur), label: monthLabelFmt.format(cur), views })
      cur = new Date(Date.UTC(y, m + 1, 1))
    }
    return { granularity, points }
  }

  const step = granularity === 'week' ? 7 : 1
  for (let t = start.getTime(); t <= end.getTime(); t += step * DAY_MS) {
    let views = 0
    for (let k = 0; k < step; k++) {
      const key = utcKey(new Date(t + k * DAY_MS))
      views += byDay[key] ?? 0
      if (granularity === 'week' && new Date(t + k * DAY_MS) > end) break
    }
    const bucketStart = new Date(t)
    points.push({ key: utcKey(bucketStart), label: formatDayKey(utcKey(bucketStart)), views })
  }
  return { granularity, points }
}
