import { api, USE_MOCK } from '../api-client'
import { db, delay, nextId, enrichPedido } from '../mock-db'
import type { Pedido, PedidoEstado, CartItem } from '../types'

export interface CheckoutInput {
  ClienteID: number
  PedidoFechaEntrega: string
  items: CartItem[]
}

export const orderService = {
  async list(): Promise<Pedido[]> {
    if (USE_MOCK) return delay(db.pedidos.map(enrichPedido))
    const { data } = await api.get('/pedidos')
    return data
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
    const { data } = await api.get(`/pedidos?ClienteID=${clienteId}`)
    return data
  },

  async get(id: number): Promise<Pedido> {
    if (USE_MOCK) {
      const p = db.pedidos.find((x) => x.PedidoID === id)
      if (!p) throw new Error('Pedido no encontrado')
      return delay(enrichPedido(p))
    }
    const { data } = await api.get(`/pedidos/${id}`)
    return data
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
    // Backend real: crear pedido y luego renglones
    const { data: pedido } = await api.post('/pedidos', {
      ClienteID: input.ClienteID,
      PedidoFechaEntrega: input.PedidoFechaEntrega,
      PedidoEstadoID: 1,
      PedidoMontoTotal: total,
    })
    await Promise.all(
      input.items.map((it) =>
        api.post('/producto-pedidos', {
          PedidoID: pedido.PedidoID,
          ProdID: it.producto.ProdID,
          Cantidad: it.cantidad,
          ProdPrecioUnitario: it.producto.ProdPrecio,
          TextoPersonalizado: it.textoPersonalizado,
        }),
      ),
    )
    return pedido
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
    const { data } = await api.put(`/pedidos/${id}`, { PedidoEstadoID })
    return data
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
    const { data } = await api.get('/pedido-estados')
    return data
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
    const { data } = await api.post('/pedido-estados', input)
    return data
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
    const { data } = await api.put(`/pedido-estados/${id}`, input)
    return data
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.pedidoEstados = db.pedidoEstados.filter((x) => x.PedidoEstadoID !== id)
      return delay(undefined)
    }
    await api.delete(`/pedido-estados/${id}`)
  },
}
