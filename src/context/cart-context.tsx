
import * as React from 'react'
import type { CartItem, Producto } from '@/lib/types'

const CART_KEY = 'blackcats_cart'

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addItem: (
    producto: Producto,
    cantidad: number,
    textoPersonalizado: string | null,
  ) => void
  updateQty: (lineId: string, cantidad: number) => void
  removeItem: (lineId: string) => void
  clear: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

function makeLineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])

  React.useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem: CartContextValue['addItem'] = (
    producto,
    cantidad,
    textoPersonalizado,
  ) => {
    setItems((prev) => {
      const normalized = textoPersonalizado?.trim() || null
      // Solo agrupamos renglones idénticos (mismo producto y mismo texto)
      const existing = prev.find(
        (it) =>
          it.producto.ProdID === producto.ProdID &&
          (it.textoPersonalizado ?? null) === normalized,
      )
      if (existing) {
        return prev.map((it) =>
          it.lineId === existing.lineId
            ? { ...it, cantidad: it.cantidad + cantidad }
            : it,
        )
      }
      return [
        ...prev,
        {
          lineId: makeLineId(),
          producto,
          cantidad,
          textoPersonalizado: normalized,
        },
      ]
    })
  }

  const updateQty = (lineId: string, cantidad: number) => {
    if (cantidad <= 0) return removeItem(lineId)
    setItems((prev) =>
      prev.map((it) => (it.lineId === lineId ? { ...it, cantidad } : it)),
    )
  }

  const removeItem = (lineId: string) =>
    setItems((prev) => prev.filter((it) => it.lineId !== lineId))

  const clear = () => setItems([])

  const count = items.reduce((sum, it) => sum + it.cantidad, 0)
  const total = items.reduce(
    (sum, it) => sum + it.producto.ProdPrecio * it.cantidad,
    0,
  )

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, updateQty, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}
