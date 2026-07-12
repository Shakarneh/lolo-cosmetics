import { createContext, useContext, useEffect, useState } from 'react'

// Cart holds only { id, qty } per line — product details are resolved from the loaded
// catalog (useProducts) so prices stay current. Persisted to localStorage (no accounts).
const CartContext = createContext(null)
const STORAGE_KEY = 'lolo_cart'
const MAX_QTY = 99

function loadInitial() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x) => x && typeof x.id === 'string' && Number(x.qty) > 0)
      .map((x) => ({ id: x.id, qty: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(x.qty)))) }))
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

  const addItem = (id, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === id)
      if (found) {
        return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i))
      }
      return [...prev, { id, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]
    })

  const setQty = (id, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    )

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
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
