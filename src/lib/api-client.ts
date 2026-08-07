import axios from 'axios'

// URL base de tu API Express. Si no se define, la app corre con datos mock.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
export const USE_MOCK = !API_URL

const TOKEN_KEY = 'blackcats_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

export const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: adjunta el JWT en cada request
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: normaliza errores
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Ocurrió un error inesperado'
    return Promise.reject(new Error(message))
  },
)
