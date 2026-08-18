import { api, unwrap, unwrapList } from '../api-client'
import type { Producto } from '../types'

export interface ProductoInput {
  ProdNombre: string
  ProdDescripcion: string | null
  SubCatID: number
  ProdEstadoID: number
  ProdImg: string | null
  ProdImgPublicId?: string | null | undefined
  EsCombo: boolean
  ProdPrecio: number
  eventoIds?: number[]
  itemIds?: number[] // productos que componen el combo
}

export const productService = {
  async list(): Promise<Producto[]> {
    const { data } = await api.get('/productos', { params: { pageSize: 200 } })
    return unwrapList<Producto>(data)
  },

  async get(id: number): Promise<Producto> {
    const { data } = await api.get(`/productos/${id}`)
    return unwrap<Producto>(data)
  },

  async create(input: ProductoInput): Promise<Producto> {
    const { data } = await api.post('/productos', input)
    return unwrap<Producto>(data)
  },

  async update(id: number, input: ProductoInput): Promise<Producto> {
    const { data } = await api.patch(`/productos/${id}`, input)
    return unwrap<Producto>(data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/productos/${id}`)
  },
}
