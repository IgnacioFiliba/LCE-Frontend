// components/AdminProtectedWrapper.tsx
"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react"
import useAuth from "@/features/login/hooks/useAuth"

interface AdminProtectedWrapperProps {
  children: React.ReactNode
  redirectTo?: string
}

const AdminProtectedWrapper: React.FC<AdminProtectedWrapperProps> = ({
  children,
  redirectTo = "/home",
}) => {
  const { user, isAdmin, loading } = useAuth() // ✅ CAMBIO: Usar isAdmin directamente
  const router = useRouter()

  useEffect(() => {
    // Si terminó de cargar y no es admin, redirigir
    if (!loading && !isAdmin) {
      console.log(
        "❌ AdminWrapper - Acceso denegado. Redirigiendo a:",
        redirectTo
      )

      // Pequeño delay para mostrar el mensaje
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, 1500)

      return () => clearTimeout(timer)
    }

    if (!loading && isAdmin) {
      console.log(
        "✅ AdminWrapper - Acceso permitido para admin:",
        user?.name || user?.email
      )
    }
  }, [isAdmin, loading, router, redirectTo, user])

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Verificando permisos de administrador...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras validamos tu acceso
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no es admin, mostrar mensaje antes del redirect
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border-l-4 border-red-500">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-red-600 mb-4">
              {!user
                ? "Debes iniciar sesión como administrador para acceder a esta página"
                : "Solo los administradores pueden acceder a esta página"}
            </p>
            <div className="text-sm text-gray-500">Redirigiendo...</div>
          </div>
        </div>
      </div>
    )
  }

  // Si es admin, mostrar el contenido
  return (
    <>
      {/* Header de confirmación admin */}
     

      {/* Contenido protegido */}
      {children}
    </>
  )
}

export default AdminProtectedWrapper
