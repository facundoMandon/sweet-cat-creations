
import * as React from 'react'
import { authService } from '@/lib/services/auth'
import { setToken, getToken } from '@/lib/api-client'
import type { Usuario } from '@/lib/types'

const USER_KEY = 'blackcats_user'

interface AuthContextValue {
  usuario: Usuario | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<Usuario>
  register: (input: {
    nombre: string
    email: string
    password: string
    telefono?: string
    direccion?: string
  }) => Promise<Usuario>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<Usuario | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Rehidratar sesión desde localStorage al montar
  React.useEffect(() => {
    try {
      const token = getToken()
      const stored = window.localStorage.getItem(USER_KEY)
      if (token && stored) setUsuario(JSON.parse(stored))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const persist = (u: Usuario, token: string) => {
    setToken(token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUsuario(u)
  }

  const login = async (email: string, password: string) => {
    const { token, usuario } = await authService.login(email, password)
    persist(usuario, token)
    return usuario
  }

  const register: AuthContextValue['register'] = async (input) => {
    const { token, usuario } = await authService.register(input)
    persist(usuario, token)
    return usuario
  }

  const logout = () => {
    setToken(null)
    window.localStorage.removeItem(USER_KEY)
    setUsuario(null)
  }

  const value: AuthContextValue = {
    usuario,
    loading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === 'admin',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
