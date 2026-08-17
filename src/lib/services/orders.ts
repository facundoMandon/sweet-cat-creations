import { api, USE_MOCK, unwrap, unwrapList } from '../api-client'
import { db, delay, nextId, enrichPedido } from '../mock-db'
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
    if (USE_MOCK) return delay(db.pedidos.map(enrichPedido))
    const { data } = await api.get('/pedidos', { params: { pageSize: 200 } })
    return unwrapList<Pedido>(data)
  },

  async listByCliente(clienteId: number): Promise<Pedido[]> {
    if (USE_MOCK) {
      return delay(
        db.pedidos
          .filter((p) => p.ClienteID === clienteId)
          .map(enrichPedido)
          .sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1)),
      )
    }
    const { data } = await api.get('/pedidos', {
      params: { clienteId, pageSize: 200 },
    })
    return unwrapList<Pedido>(data)
  },

  async get(id: number): Promise<Pedido> {
    if (USE_MOCK) {
      const p = db.pedidos.find((x) => x.PedidoID === id)
      if (!p) throw new Error('Pedido no encontrado')
      return delay(enrichPedido(p))
    }
    const { data } = await api.get(`/pedidos/${id}`)
    return unwrap<Pedido>(data)
  },

  // Crea el Pedido + sus ProductoPedido (renglones)
  async checkout(input: CheckoutInput): Promise<Pedido> {
    const total = input.items.reduce(
      (sum, it) => sum + it.producto.ProdPrecio * it.cantidad,
      0,
    )
    if (USE_MOCK) {
      const PedidoID = nextId(db.pedidos, 'PedidoID')
      const pedido: Pedido = {
        PedidoID,
        PedidoFechaEntrega: input.PedidoFechaEntrega,
        PedidoEstadoID: 1, // Pendiente
        ClienteID: input.ClienteID,
        PedidoMontoTotal: total,
        PedidoDireccion: input.PedidoDireccion ?? null,
        PedidoLat: input.PedidoLat ?? null,
        PedidoLng: input.PedidoLng ?? null,
        PedidoPlaceID: input.PedidoPlaceID ?? null,
        PedidoReferencias: input.PedidoReferencias ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.pedidos.push(pedido)
      input.items.forEach((it) => {
        db.productoPedidos.push({
          ProdPedidoID: nextId(db.productoPedidos, 'ProdPedidoID'),
          PedidoID,
          ProdID: it.producto.ProdID,
          Cantidad: it.cantidad,
          ProdPrecioUnitario: it.producto.ProdPrecio,
          TextoPersonalizado: it.textoPersonalizado,
        })
      })
      // Notificación de pedido creado
      db.notificaciones.push({
        NotifID: nextId(db.notificaciones, 'NotifID'),
        NotiEstado: 'pendiente',
        NotiFecha: new Date().toISOString(),
        PedidoID,
      })
      return delay(enrichPedido(pedido))
    }
    // Backend real: el pedido se crea con sus renglones en una sola llamada.
    // El total y los precios los recalcula el servidor desde la base.
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
    if (USE_MOCK) {
      const idx = db.pedidos.findIndex((x) => x.PedidoID === id)
      db.pedidos[idx] = {
        ...db.pedidos[idx]!,
        PedidoEstadoID,
        updatedAt: new Date().toISOString(),
      }
      return delay(enrichPedido(db.pedidos[idx]!))
    }
    const { data } = await api.patch(`/pedidos/${id}/status`, { PedidoEstadoID })
    return unwrap<Pedido>(data)
  },

  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.pedidos = db.pedidos.filter((x) => x.PedidoID !== id)
      db.productoPedidos = db.productoPedidos.filter((x) => x.PedidoID !== id)
      return delay(undefined)
    }
    await api.delete(`/pedidos/${id}`)
  },
}

export const pedidoEstadoService = {
  async list(): Promise<PedidoEstado[]> {
    if (USE_MOCK) return delay(db.pedidoEstados)
    const { data } = await api.get('/estados/pedidos')
    return unwrapList<PedidoEstado>(data)
  },
  async create(input: {
    PedidoEstadoDescripcion: string
  }): Promise<PedidoEstado> {
    if (USE_MOCK) {
      const nuevo = {
        PedidoEstadoID: nextId(db.pedidoEstados, 'PedidoEstadoID'),
        ...input,
      }
      db.pedidoEstados.push(nuevo)
      return delay(nuevo)
    }
    throw new Error('Los estados de pedido son fijos y no se pueden crear')
  },
  async update(
    id: number,
    input: { PedidoEstadoDescripcion: string },
  ): Promise<PedidoEstado> {
    if (USE_MOCK) {
      const idx = db.pedidoEstados.findIndex((x) => x.PedidoEstadoID === id)
      db.pedidoEstados[idx] = { ...db.pedidoEstados[idx]!, ...input }
      return delay(db.pedidoEstados[idx]!)
    }
    throw new Error('Los estados de pedido son fijos y no se pueden editar')
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.pedidoEstados = db.pedidoEstados.filter((x) => x.PedidoEstadoID !== id)
      return delay(undefined)
    }
    throw new Error('Los estados de pedido son fijos y no se pueden eliminar')
  },
}
