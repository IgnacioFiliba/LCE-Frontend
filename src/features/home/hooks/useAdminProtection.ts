/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAdminProtection.ts
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/features/login/hooks/useAuth'

interface UseAdminProtectionOptions {
  redirectTo?: string
  showAlert?: boolean
}

interface UseAdminProtectionReturn {
  user: any
  loading: boolean
  isAdmin: boolean
  isAuthorized: boolean
  error: string | null
}

export const useAdminProtection = (
  options: UseAdminProtectionOptions = {}
): UseAdminProtectionReturn => {
  const { 
    redirectTo = '/', 
    showAlert = true 
  } = options
  
  const { user, loading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Verificar si el usuario es admin
  const isAdmin = Boolean(user?.isAdmin)
  const isAuthenticated = Boolean(user)
  const isAuthorized = isAuthenticated && isAdmin

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (loading) {
      setError(null)
      return
    }

    // Si no hay usuario autenticado
    if (!isAuthenticated && !hasRedirected) {
      setError('Debes iniciar sesión para acceder a esta página')
      if (showAlert) {
        alert('⚠️ Acceso Denegado: Debes iniciar sesión para acceder a esta página')
      }
      setHasRedirected(true)
      router.push(redirectTo)
      return
    }

    // Si hay usuario pero no es admin
    if (isAuthenticated && !isAdmin && !hasRedirected) {
      setError('No tienes permisos de administrador para acceder a esta página')
      if (showAlert) {
        alert('🔒 Acceso Denegado: Solo los administradores pueden acceder a esta página')
      }
      setHasRedirected(true)
      router.push(redirectTo)
      return
    }

    // Si todo está bien, limpiar errores
    if (isAuthorized) {
      setError(null)
      setHasRedirected(false)
    }
  }, [user, loading, isAdmin, isAuthenticated, isAuthorized, router, redirectTo, showAlert, hasRedirected])

  return {
    user,
    loading,
    isAdmin,
    isAuthorized,
    error
  }
}

export default useAdminProtection