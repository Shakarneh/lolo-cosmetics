import { variantLabel } from './variations.js'

export const WHATSAPP_NUMBER = '970593950074'

export function whatsappLink(product, variant = null) {
  const code = variant?.code || product.code
  const label = variant ? ` (${variantLabel(variant)})` : ''
  const price = variant?.price != null ? ` — ${variant.price} ₪` : ''
  const msg = `مرحباً، أود الاستفسار عن المنتج: ${product.nameAr}${label} (كود: ${code})${price}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

// greeting for the general contact buttons (wording = open question 10 — easy to change here)
export function generalWhatsappLink() {
  const msg = 'مرحباً لولو كوزمتكس 🌸 أود الاستفسار عن منتجاتكم'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

// Multi-item order message from the cart.
// entries: [{ nameAr, code, qty, unitPrice }] where unitPrice may be null (سعر عند الطلب).
export function cartMessage(entries) {
  const lines = entries.map((e) => {
    const price = e.unitPrice != null ? ` — ${e.unitPrice} ₪` : ''
    return `• ${e.nameAr} (كود: ${e.code}) × ${e.qty}${price}`
  })
  const priced = entries.filter((e) => e.unitPrice != null)
  const total = priced.reduce((sum, e) => sum + e.unitPrice * e.qty, 0)
  let totalLine = ''
  if (priced.length) {
    totalLine = `\n\nالإجمالي التقريبي: ${total} ₪`
    if (priced.length < entries.length) totalLine += '\n(بعض المنتجات بحاجة إلى تسعير)'
  }
  return `مرحباً لولو كوزمتكس 🌸\nأود طلب المنتجات التالية:\n\n${lines.join('\n')}${totalLine}`
}

export function cartWhatsappLink(entries) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cartMessage(entries))}`
}

// Package order message: bundle name + every included product + the bundle price.
// items: [{ nameAr, code, quantity }]
export function packageMessage(pkg, items) {
  const lines = items.map((e) => `• ${e.nameAr} (كود: ${e.code}) × ${e.quantity}`)
  const priceLine = pkg.price != null ? `\n\nسعر البكج: ${pkg.price} ₪` : ''
  return `مرحباً لولو كوزمتكس 🌸\nأود طلب البكج «${pkg.nameAr}»:\n\n${lines.join('\n')}${priceLine}`
}

export function packageWhatsappLink(pkg, items) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(packageMessage(pkg, items))}`
}
