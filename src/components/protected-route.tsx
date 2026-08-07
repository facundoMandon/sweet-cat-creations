'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import type { Rol } from '@/lib/types'
import { CatLoader } from '@/components/cat-loader'

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode
  requireRole?: Rol
}) {
  const { usuario, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      const next = requireRole === 'admin' ? '/admin' : ''
      router.replace(`/login${next ? `?next=${next}` : ''}`)
      return
    }
    if (requireRole && usuario?.rol !== requireRole) {
      router.replace(usuario?.rol === 'admin' ? '/admin' : '/')
    }
  }, [loading, isAuthenticated, requireRole, usuario, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <CatLoader label="Cargando tu sesión..." />
      </div>
    )
  }

  if (requireRole && usuario?.rol !== requireRole) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <CatLoader label="Redirigiendo..." />
      </div>
    )
  }

  return <>{children}</>
}
