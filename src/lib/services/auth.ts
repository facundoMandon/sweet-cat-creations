import { api, USE_MOCK } from '../api-client'
import { db, delay, nextId } from '../mock-db'
import type { Usuario } from '../types'

export interface AuthResult {
  token: string
  usuario: Usuario
}

// Cuentas demo para el preview (modo mock). En producción esto lo valida tu API.
const DEMO_USERS: Array<{ password: string } & Usuario> = [
  {
    id: 1,
    nombre: 'Admin Black Cats',
    email: 'admin@blackcats.com',
    password: 'admin123',
    rol: 'admin',
  },
  {
    id: 2,
    nombre: 'María López',
    email: 'cliente@blackcats.com',
    password: 'cliente123',
    rol: 'cliente',
    clienteId: 1,
  },
]

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    if (USE_MOCK) {
      const found = DEMO_USERS.find(
        (u) => u.email === email && u.password === password,
      )
      if (!found) throw new Error('Correo o contraseña incorrectos')
      const { password: _pw, ...usuario } = found
      return delay({ token: `mock.jwt.${found.id}.${Date.now()}`, usuario })
    }
    // Backend real: POST /api/auth/login -> { token, usuario }
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async register(input: {
    nombre: string
    email: string
    password: string
    telefono?: string
    direccion?: string
  }): Promise<AuthResult> {
    if (USE_MOCK) {
      if (DEMO_USERS.some((u) => u.email === input.email)) {
        throw new Error('Ese correo ya está registrado')
      }
      const clienteId = nextId(db.clientes, 'ClienteID')
      db.clientes.push({
        ClienteID: clienteId,
        ClienteNombre: input.nombre,
        ClienteTelefono: input.telefono ?? null,
        ClienteDireccion: input.direccion ?? null,
        createdAt: new Date().toISOString(),
      })
      const usuario: Usuario = {
        id: 100 + clienteId,
        nombre: input.nombre,
        email: input.email,
        rol: 'cliente',
        clienteId,
      }
      return delay({ token: `mock.jwt.${usuario.id}.${Date.now()}`, usuario })
    }
    const { data } = await api.post('/auth/register', input)
    return data
  },

  async me(): Promise<Usuario> {
    // Backend real: GET /api/auth/me con el token en el header
    const { data } = await api.get('/auth/me')
    return data
  },
}
