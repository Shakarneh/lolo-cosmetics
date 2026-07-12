// Shared variation helpers (admin editor + storefront).
// attributes: [{ name, values: string[] }]   e.g. { name:'اللون', values:['أحمر','أزرق'] }
// variants:   [{ key, values: {attrName: value}, price, code }]  — one per COMBINATION

// active = attributes that actually have a name and at least one value
function activeAttrs(attributes) {
  return (attributes ?? []).filter((a) => a.name && (a.values?.length ?? 0) > 0)
}

// Cartesian product of every attribute's values → array of {attrName: value} maps.
export function cartesian(attributes) {
  const active = activeAttrs(attributes)
  if (active.length === 0) return []
  let combos = [{}]
  for (const a of active) {
    const next = []
    for (const c of combos) for (const v of a.values) next.push({ ...c, [a.name]: v })
    combos = next
  }
  return combos
}

// Stable key for a combination (used to preserve price/code across regen).
export function variantKey(attributes, values) {
  return activeAttrs(attributes)
    .map((a) => values[a.name])
    .join(' | ')
}

// Regenerate the combination list from attributes, carrying over price/code by key.
export function regenVariants(attributes, oldVariants = []) {
  const prev = new Map(oldVariants.map((v) => [v.key, v]))
  return cartesian(attributes).map((values) => {
    const key = variantKey(attributes, values)
    const old = prev.get(key)
    return { key, values, price: old?.price ?? '', code: old?.code ?? '' }
  })
}

// Human label for one variation combination, e.g. «أحمر · 50 مل».
export function variantLabel(variant) {
  return Object.values(variant.values ?? {}).filter(Boolean).join(' · ')
}

// min/max numeric price across variants (for cards / detail range). Ignores blanks.
export function priceRange(variants = []) {
  const nums = variants
    .map((v) => (v.price === '' || v.price == null ? null : Number(v.price)))
    .filter((n) => Number.isFinite(n))
  if (nums.length === 0) return null
  return { min: Math.min(...nums), max: Math.max(...nums) }
}
