"use client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import React, { useState, useEffect } from "react"

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const ButtonGoogle = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    console.log("🔍 ButtonGoogle montado")
  }, [])

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    console.log("🚨 INICIO - handleGoogleLogin ejecutado")
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    setError(null)

    try {
      // ✅ CREAR URL COMPLETA MANUALMENTE PARA FORZAR SELECCIÓN
      const googleClientId =
        "906975497977-j0vr60a3ijerhahsnnpsshdnaujj5et5.apps.googleusercontent.com"
      const redirectUri =
        "https://pf-grupo5-8.onrender.com/auth/google/redirect"

      // Construir URL de Google con selección forzada
      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      )
      googleAuthUrl.searchParams.append("client_id", googleClientId)
      googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
      googleAuthUrl.searchParams.append("response_type", "code")
      googleAuthUrl.searchParams.append("scope", "openid email profile")
      googleAuthUrl.searchParams.append("prompt", "select_account") // ← FORZAR SELECCIÓN
      googleAuthUrl.searchParams.append("access_type", "offline")

      console.log(
        "🎯 URL completa con selección forzada:",
        googleAuthUrl.toString()
      )
      console.log("🚀 Yendo directo a Google...")

      // Ir directo a Google saltando el backend
      window.location.href = googleAuthUrl.toString()
    } catch (error) {
      console.error("❌ Error en Google Auth:", error)
      setError(
        error instanceof Error ? error.message : "Error iniciando autenticación"
      )
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-94 h-12 rounded-2xl flex items-center justify-center gap-3 bg-gray-200 text-gray-500 border border-gray-300">
          <GoogleIcon />
          <span className="font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Mostrar error si existe */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center">
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="outline"
          className="w-94 h-12 rounded-2xl flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium">
            {isLoading ? "Conectando..." : "Continuar con Google"}
          </span>
        </Button>
      </div>
    </div>
  )
}

export default ButtonGoogle
