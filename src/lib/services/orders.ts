import { api, unwrap, unwrapList } from '../api-client'
import type { Pedido, PedidoEstado, CartItem } from '../types'

export interface CheckoutInput {
  ClienteID: number
  PedidoFechaEntrega: string
  items: CartItem[]
  /** Ubicación de entrega elegida en el mapa. */
  PedidoDireccion?: string | null
  PedidoLat?: number | null
  PedidoLng?: number | null
  PedidoPlaceID?: string | null
  PedidoReferencias?: string | null
}

export const orderService = {
  async list(): Promise<Pedido[]> {
    const { data } = await api.get('/pedidos', { params: { pageSize: 200 } })
    return unwrapList<Pedido>(data)
  },

  async listByCliente(clienteId: number): Promise<Pedido[]> {
    const { data } = await api.get('/pedidos', {
      params: { clienteId, pageSize: 200 },
    })
    return unwrapList<Pedido>(data)
  },

  async get(id: number): Promise<Pedido> {
    const { data } = await api.get(`/pedidos/${id}`)
    return unwrap<Pedido>(data)
  },

  // Crea el Pedido + sus ProductoPedido (renglones)
  async checkout(input: CheckoutInput): Promise<Pedido> {
    const { data } = await api.post('/pedidos', {
      ClienteID: input.ClienteID,
      PedidoFechaEntrega: input.PedidoFechaEntrega,
      PedidoDireccion: input.PedidoDireccion ?? null,
      PedidoLat: input.PedidoLat ?? null,
      PedidoLng: input.PedidoLng ?? null,
      PedidoPlaceID: input.PedidoPlaceID ?? null,
      PedidoReferencias: input.PedidoReferencias ?? null,
      renglones: input.items.map((it) => ({
        ProdID: it.producto.ProdID,
        Cantidad: it.cantidad,
        TextoPersonalizado: it.textoPersonalizado ?? null,
      })),
    })
    return unwrap<Pedido>(data)
  },

  async updateEstado(id: number, PedidoEstadoID: number): Promise<Pedido> {
    const { data } = await api.patch(`/pedidos/${id}/status`, { PedidoEstadoID })
    return unwrap<Pedido>(data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/pedidos/${id}`)
  },
}

export const pedidoEstadoService = {
  async list(): Promise<PedidoEstado[]> {
    const { data } = await api.get('/estados/pedidos')
    return unwrapList<PedidoEstado>(data)
  },
  async create(): Promise<PedidoEstado> {
    throw new Error('Los estados de pedido son fijos y no se pueden crear')
  },
  async update(): Promise<PedidoEstado> {
    throw new Error('Los estados de pedido son fijos y no se pueden editar')
  },
  async remove(): Promise<void> {
    throw new Error('Los estados de pedido son fijos y no se pueden eliminar')
  },
}
