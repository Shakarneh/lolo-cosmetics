export const categories = [
  { slug: 'makeup', name: 'المكياج' },
  { slug: 'skincare', name: 'العناية بالبشرة' },
  { slug: 'body', name: 'العناية بالجسم' },
  { slug: 'hair', name: 'العناية بالشعر' },
  { slug: 'perfume', name: 'العطور' },
  { slug: 'other', name: 'مستلزمات أخرى' },
]

export const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]))

export const categoryEmoji = {
  makeup: '💄',
  skincare: '✨',
  body: '🧴',
  hair: '🌿',
  perfume: '🌸',
  other: '🛍️',
}
