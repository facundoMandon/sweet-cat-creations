import { api, USE_MOCK, unwrap, unwrapList } from '../api-client'
import { db, delay, nextId, enrichProducto } from '../mock-db'
import type { Producto } from '../types'

export interface ProductoInput {
  ProdNombre: string
  ProdDescripcion: string | null
  SubCatID: number
  ProdEstadoID: number
  ProdImg: string | null
  ProdImgPublicId?: string | null
  EsCombo: boolean
  ProdPrecio: number
  eventoIds?: number[]
  itemIds?: number[] // productos que componen el combo
}

export const productService = {
  async list(): Promise<Producto[]> {
    if (USE_MOCK) return delay(db.productos.map(enrichProducto))
    const { data } = await api.get('/productos', { params: { pageSize: 200 } })
    return unwrapList<Producto>(data)
  },

  async get(id: number): Promise<Producto> {
    if (USE_MOCK) {
      const p = db.productos.find((x) => x.ProdID === id)
      if (!p) throw new Error('Producto no encontrado')
      return delay(enrichProducto(p))
    }
    const { data } = await api.get(`/productos/${id}`)
    return unwrap<Producto>(data)
  },

  async create(input: ProductoInput): Promise<Producto> {
    if (USE_MOCK) {
      const ProdID = nextId(db.productos, 'ProdID')
      const nuevo: Producto = {
        ProdID,
        ProdNombre: input.ProdNombre,
        ProdDescripcion: input.ProdDescripcion,
        SubCatID: input.SubCatID,
        ProdEstadoID: input.ProdEstadoID,
        ProdImg: input.ProdImg,
        ProdImgPublicId: input.ProdImgPublicId ?? null,
        EsCombo: input.EsCombo,
        ProdPrecio: input.ProdPrecio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.productos.push(nuevo)
      syncRelations(ProdID, input)
      return delay(enrichProducto(nuevo))
    }
    const { data } = await api.post('/productos', input)
    return unwrap<Producto>(data)
  },

  async update(id: number, input: ProductoInput): Promise<Producto> {
    if (USE_MOCK) {
      const idx = db.productos.findIndex((x) => x.ProdID === id)
      if (idx === -1) throw new Error('Producto no encontrado')
      db.productos[idx] = {
        ...db.productos[idx]!,
        ...input,
        ProdID: id,
        updatedAt: new Date().toISOString(),
      }
      syncRelations(id, input)
      return delay(enrichProducto(db.productos[idx]!))
    }
    const { data } = await api.patch(`/productos/${id}`, input)
    return unwrap<Producto>(data)
  },

  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.productos = db.productos.filter((x) => x.ProdID !== id)
      db.prodEventos = db.prodEventos.filter((x) => x.ProdID !== id)
      db.productoCombos = db.productoCombos.filter(
        (x) => x.ComboProdID !== id && x.ItemProdID !== id,
      )
      return delay(undefined)
    }
    await api.delete(`/productos/${id}`)
  },
}

function syncRelations(prodId: number, input: ProductoInput) {
  if (input.eventoIds) {
    db.prodEventos = db.prodEventos.filter((x) => x.ProdID !== prodId)
    input.eventoIds.forEach((EventoID) =>
      db.prodEventos.push({ ProdID: prodId, EventoID }),
    )
  }
  if (input.EsCombo && input.itemIds) {
    db.productoCombos = db.productoCombos.filter((x) => x.ComboProdID !== prodId)
    input.itemIds.forEach((ItemProdID) =>
      db.productoCombos.push({ ComboProdID: prodId, ItemProdID }),
    )
  }
  if (!input.EsCombo) {
    db.productoCombos = db.productoCombos.filter((x) => x.ComboProdID !== prodId)
  }
}
