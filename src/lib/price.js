import { priceRange } from './variations.js'

const CONTACT = 'تواصل معنا للسعر'

// Format a numeric range: single price, or «min – max ₪».
export function formatRange(range) {
  if (!range) return CONTACT
  return range.min === range.max ? `${range.min} ₪` : `${range.min} – ${range.max} ₪`
}

// Display price string for a product (card / search). Handles variations, sale, and null.
export function priceLabel(product) {
  if (product.variations?.variants?.length) {
    return formatRange(priceRange(product.variations.variants))
  }
  if (product.onSale && product.salePrice != null) return `${product.salePrice} ₪`
  if (product.retailPrice != null) return `${product.retailPrice} ₪`
  return CONTACT
}

export function hasVariations(product) {
  return !!product?.variations?.variants?.length
}
