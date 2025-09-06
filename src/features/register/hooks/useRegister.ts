// hooks/useRegister.ts
import { useState, useCallback } from "react"
import { RegisterData } from "@/features/register/types/register" // Cambiar import
import { authService } from "@/features/login/services/login-service"

interface RegisterResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: number
    country: string
    address: string
    city: string
    isAdmin: boolean
    isSuperAdmin: boolean
  }
}

interface UseRegisterReturn {
  register: (userData: RegisterData) => Promise<RegisterResponse> // Cambiar tipo
  loading: boolean
  error: string | null
  success: boolean
  clearStatus: () => void
}

const useRegister = (): UseRegisterReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = useCallback(
    async (userData: RegisterData): Promise<RegisterResponse> => { // Cambiar tipo
      // Debug diferente para FormData vs objeto
      if (userData instanceof FormData) {
        console.log("🔧 Hook recibió FormData con keys:")
        for (const [key, value] of userData.entries()) {
          console.log(`${key}:`, typeof value === 'object' ? value.constructor.name : value)
        }
      } else {
        console.log("🔧 Hook userData keys:", Object.keys(userData))
        console.log("🔧 Hook userData:", JSON.stringify(userData, null, 2))
      }

      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const result = await authService.register(userData)
        setSuccess(true)
        console.log("✅ Registro exitoso, pero sin auto-login")
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al registrar usuario"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearStatus = useCallback(() => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }, [])

  return {
    register,
    loading,
    error,
    success,
    clearStatus,
  }
}

export default useRegister