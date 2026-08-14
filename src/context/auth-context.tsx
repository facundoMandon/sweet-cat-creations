
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
    apellido?: string
    email: string
    password: string
    telefono?: string
    direccion?: string
  }) => Promise<Usuario>
  logout: () => Promise<void>
  refresh: () => Promise<void>
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

  const persist = React.useCallback((u: Usuario | null, token?: string | null) => {
    if (token !== undefined) setToken(token)
    if (u) window.localStorage.setItem(USER_KEY, JSON.stringify(u))
    else window.localStorage.removeItem(USER_KEY)
    setUsuario(u)
  }, [])

  // Rehidratación optimista + validación real contra el backend (verifica
  // usuario, contraseña ya validada al emitir el token, y rol vigente).
  React.useEffect(() => {
    let active = true
    try {
      const token = getToken()
      const stored = window.localStorage.getItem(USER_KEY)
      if (token && stored) setUsuario(JSON.parse(stored))
    } catch {
      // ignore
    }
    void authService.session().then((u) => {
      if (!active) return
      persist(u)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [persist])

  // Renovación silenciosa del access token (dura 15 min).
  React.useEffect(() => {
    if (!usuario) return
    const id = window.setInterval(
      () => {
        void authService.refresh().catch(() => persist(null, null))
      },
      12 * 60 * 1000,
    )
    return () => window.clearInterval(id)
  }, [usuario, persist])

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

  const logout = async () => {
    await authService.logout()
    persist(null, null)
  }

  const refreshSession = async () => {
    const u = await authService.session()
    persist(u)
  }


  const value: AuthContextValue = {
    usuario,
    loading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === 'admin',
    login,
    register,
    logout,
    refresh: refreshSession,

  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
