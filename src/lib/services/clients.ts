import { api, unwrap, unwrapList } from '../api-client'
import type { Cliente, Notificacion } from '../types'

export interface ClienteInput {
  ClienteNombre: string
  ClienteApellido?: string
  /** Sólo en el alta: identidad del usuario asociado. */
  ClienteEmail?: string
  password?: string
  ClienteTelefono: string
  ClienteDireccion: string
  /** Punto exacto guardado del perfil (elegido en el mapa). */
  ClienteLat?: number | null
  ClienteLng?: number | null
  ClientePlaceID?: string | null
}

export const clientService = {
  async list(): Promise<Cliente[]> {
    const { data } = await api.get('/clientes', { params: { pageSize: 200 } })
    return unwrapList<Cliente>(data)
  },
  async get(id: number): Promise<Cliente> {
    const { data } = await api.get(`/clientes/${id}`)
    return unwrap<Cliente>(data)
  },
  async create(input: ClienteInput): Promise<Cliente> {
    const { data } = await api.post('/clientes', input)
    return unwrap<Cliente>(data)
  },
  async update(id: number, input: ClienteInput): Promise<Cliente> {
    const { data } = await api.patch(`/clientes/${id}`, input)
    return unwrap<Cliente>(data)
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`)
  },
}

export const notificationService = {
  async list(): Promise<Notificacion[]> {
    const { data } = await api.get('/notificaciones', { params: { pageSize: 100 } })
    return unwrapList<Notificacion>(data)
  },
}
