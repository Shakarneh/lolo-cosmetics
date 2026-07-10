export const WHATSAPP_NUMBER = '970593950074'

export function whatsappLink(product) {
  const msg = `مرحباً، أود الاستفسار عن المنتج: ${product.nameAr} (كود: ${product.code})`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

// greeting for the general contact buttons (wording = open question 10 — easy to change here)
export function generalWhatsappLink() {
  const msg = 'مرحباً لولو كوزمتكس 🌸 أود الاستفسار عن منتجاتكم'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}
