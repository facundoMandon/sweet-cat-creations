import axios from 'axios'

import { API_URL, getToken, setToken } from '../api-client'
import type { Usuario } from '../types'

export interface AuthResult {
  token: string
  expiresIn: number
  usuario: Usuario
}

/**
 * Cliente dedicado a la autenticación contra la API Express externa
 * (VITE_API_URL, ej: https://api-blackcats.onrender.com) en /api/auth/*.
 * `withCredentials` permite que viaje la cookie httpOnly con el refresh token.
 */
const authApi = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

authApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Ocurrió un error inesperado'
    return Promise.reject(new Error(message))
  },
)

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const { data } = await authApi.post<AuthResult>('/login', {
      email,
      password,
    })
    setToken(data.token)
    return data
  },

  async register(input: {
    nombre: string
    email: string
    password: string
    telefono?: string
    direccion?: string
  }): Promise<AuthResult> {
    const { data } = await authApi.post<AuthResult>('/register', input)
    setToken(data.token)
    return data
  },

  /** Renueva el access token usando la cookie httpOnly de refresh. */
  async refresh(): Promise<AuthResult> {
    const { data } = await authApi.post<AuthResult>('/refresh')
    setToken(data.token)
    return data
  },

  /** Devuelve el usuario del access token vigente (valida usuario y rol). */
  async me(): Promise<Usuario> {
    const token = getToken()
    if (!token) throw new Error('No hay sesión activa')
    const { data } = await authApi.get<{ success: boolean; data: Usuario }>(
      '/me',
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data.data
  },

  /**
   * Devuelve la sesión vigente: intenta con el access token y, si expiró,
   * hace un refresh transparente. `null` si no hay sesión.
   */
  async session(): Promise<Usuario | null> {
    try {
      return await this.me()
    } catch {
      try {
        const renewed = await this.refresh()
        return renewed.usuario
      } catch {
        setToken(null)
        return null
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/logout')
    } finally {
      setToken(null)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('blackcats_user')
      }
    }
  },
}
