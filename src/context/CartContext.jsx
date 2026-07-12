import { createContext, useContext, useEffect, useState } from 'react'

// Cart holds { id, variantKey, qty } per line — product details are resolved from the loaded
// catalog (useProducts) so prices stay current. A product with different variations selected
// makes separate lines (identity = id + variantKey). Persisted to localStorage (no accounts).
const CartContext = createContext(null)
const STORAGE_KEY = 'lolo_cart'
const MAX_QTY = 99

// stable identity for a cart line (product + chosen variation)
export function lineKeyOf(id, variantKey) {
  return `${id}::${variantKey ?? ''}`
}

function loadInitial() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x) => x && typeof x.id === 'string' && Number(x.qty) > 0)
      .map((x) => ({
        id: x.id,
        variantKey: x.variantKey ?? null,
        qty: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(x.qty)))),
      }))
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable (private mode) — cart just won't persist */
    }
  }, [items])

  const addItem = (id, qty = 1, variantKey = null) =>
    setItems((prev) => {
      const key = lineKeyOf(id, variantKey)
      const found = prev.find((i) => lineKeyOf(i.id, i.variantKey) === key)
      if (found) {
        return prev.map((i) =>
          lineKeyOf(i.id, i.variantKey) === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        )
      }
      return [...prev, { id, variantKey, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]
    })

  const setQty = (lineKey, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => lineKeyOf(i.id, i.variantKey) !== lineKey)
        : prev.map((i) => (lineKeyOf(i.id, i.variantKey) === lineKey ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    )

  const removeItem = (lineKey) =>
    setItems((prev) => prev.filter((i) => lineKeyOf(i.id, i.variantKey) !== lineKey))
  const clear = () => setItems([])

  const count = items.reduce((n, i) => n + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
