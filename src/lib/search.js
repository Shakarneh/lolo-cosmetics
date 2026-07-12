import { categoryNames } from '../data/categories.js'

// Normalize Arabic text for forgiving search:
// - strip tashkeel (diacritics) + superscript alef + tatweel
// - unify alef variants (أ إ آ ٱ → ا), hamza carriers (ؤ ئ → و/ي), ة → ه, ى → ي
// - drop RTL/LTR marks, lowercase latin, collapse whitespace
export function normalizeArabic(str = '') {
  return String(str)
    .replace(/[ً-ْٰ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[‎‏]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Smart, forgiving search over the loaded products. Every space-separated term must
// appear somewhere in name+brand+category+code (AND). Results are ranked: name-start >
// name-contains > earliest match. `limit` caps the count (dropdown uses 6).
export function searchProducts(products, query, limit = Infinity) {
  const q = normalizeArabic(query)
  if (!q) return []
  const terms = q.split(' ').filter(Boolean)

  const scored = []
  for (const p of products) {
    const name = normalizeArabic(p.nameAr)
    const haystack = normalizeArabic(
      [p.nameAr, p.brand, categoryNames[p.category] ?? '', p.code].join(' ')
    )
    if (!terms.every((t) => haystack.includes(t))) continue

    let score = 0
    if (name.startsWith(q)) score += 100
    else if (name.includes(q)) score += 50
    score += Math.max(0, 30 - haystack.indexOf(terms[0]))
    scored.push({ p, score })
  }

  scored.sort((a, b) => b.score - a.score)
  const out = scored.map((s) => s.p)
  return limit === Infinity ? out : out.slice(0, limit)
}
