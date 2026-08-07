import { api, USE_MOCK } from '../api-client'
import { db, delay, nextId } from '../mock-db'
import type { Cliente, Notificacion } from '../types'

export interface ClienteInput {
  ClienteNombre: string
  ClienteTelefono: string | null
  ClienteDireccion: string | null
}

export const clientService = {
  async list(): Promise<Cliente[]> {
    if (USE_MOCK) return delay(db.clientes)
    const { data } = await api.get('/clientes')
    return data
  },
  async get(id: number): Promise<Cliente> {
    if (USE_MOCK) {
      const c = db.clientes.find((x) => x.ClienteID === id)
      if (!c) throw new Error('Cliente no encontrado')
      return delay(c)
    }
    const { data } = await api.get(`/clientes/${id}`)
    return data
  },
  async create(input: ClienteInput): Promise<Cliente> {
    if (USE_MOCK) {
      const nuevo: Cliente = {
        ClienteID: nextId(db.clientes, 'ClienteID'),
        ...input,
        createdAt: new Date().toISOString(),
      }
      db.clientes.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/clientes', input)
    return data
  },
  async update(id: number, input: ClienteInput): Promise<Cliente> {
    if (USE_MOCK) {
      const idx = db.clientes.findIndex((x) => x.ClienteID === id)
      db.clientes[idx] = { ...db.clientes[idx], ...input }
      return delay(db.clientes[idx])
    }
    const { data } = await api.put(`/clientes/${id}`, input)
    return data
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.clientes = db.clientes.filter((x) => x.ClienteID !== id)
      return delay(undefined)
    }
    await api.delete(`/clientes/${id}`)
  },
}

export const notificationService = {
  async list(): Promise<Notificacion[]> {
    if (USE_MOCK) {
      return delay(
        db.notificaciones
          .map((n) => ({
            ...n,
            pedido: db.pedidos.find((p) => p.PedidoID === n.PedidoID),
          }))
          .sort((a, b) => (a.NotiFecha < b.NotiFecha ? 1 : -1)),
      )
    }
    const { data } = await api.get('/notificaciones')
    return data
  },
}
