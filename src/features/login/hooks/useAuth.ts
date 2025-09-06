// hooks/useAuth.ts - VERSIÓN MEJORADA
import { useState, useCallback, useEffect } from "react"
import { User, LoginRequest, AuthResponse } from "../types/login"
import { RegisterRequest } from "../../register/types/register"
import { authService } from "../services/login-service"

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (userData: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  clearError: () => void
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ FUNCIÓN PARA VERIFICAR AUTH STATE
  const checkAuthState = useCallback(() => {
    console.log("🔄 useAuth - Verificando estado de auth...")

    try {
      const savedUser = authService.getUser()
      const isAuth = authService.isAuthenticated()

      console.log("🔍 useAuth - savedUser:", savedUser)
      console.log("🔍 useAuth - isAuthenticated:", isAuth)

      if (savedUser && isAuth) {
        setUser(savedUser)
        console.log("✅ useAuth - Usuario configurado:", {
          email: savedUser.email,
          isAdmin: savedUser.isAdmin,
          isSuperAdmin: savedUser.isSuperAdmin,
        })
        return true
      } else {
        setUser(null)
        console.log("❌ useAuth - No hay usuario válido")
        return false
      }
    } catch (err) {
      console.error("❌ useAuth - Error verificando auth state:", err)
      setUser(null)
      setError("Error al verificar autenticación")
      return false
    }
  }, [])

  // ✅ INICIALIZACIÓN CON MÚLTIPLES VERIFICACIONES
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 useAuth - Inicializando...")
      setLoading(true)

      // Primera verificación inmediata
      const hasUser = checkAuthState()

      // ✅ NUEVO: Si no hay usuario, esperar un poco y verificar de nuevo
      // Esto ayuda con el timing del login de Google
      if (!hasUser) {
        console.log(
          "🔄 useAuth - Sin usuario, esperando 500ms y verificando de nuevo..."
        )
        await new Promise((resolve) => setTimeout(resolve, 500))
        checkAuthState()
      }

      setLoading(false)
      console.log("✅ useAuth - Inicialización completada")
    }

    initializeAuth()
  }, [checkAuthState])

  // ✅ NUEVO: Escuchar cambios en localStorage (para Google OAuth)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        console.log("🔔 useAuth - Cambio detectado en localStorage:", e.key)

        // Pequeño delay para asegurar que todos los datos estén guardados
        setTimeout(() => {
          checkAuthState()
        }, 100)
      }
    }

    // ✅ NUEVO: Escuchar evento customizado para forzar verificación
    const handleAuthUpdate = () => {
      console.log("🔔 useAuth - Evento de actualización de auth recibido")
      checkAuthState()
    }

    // Agregar listeners
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-updated", handleAuthUpdate)

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-updated", handleAuthUpdate)
    }
  }, [checkAuthState])

  // ✅ NUEVO: Verificación periódica ligera (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo verificar si no tenemos usuario pero hay token
      const token = localStorage.getItem("token")
      if (!user && token) {
        console.log(
          "🔄 useAuth - Verificación periódica: hay token pero no usuario"
        )
        checkAuthState()
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [user, checkAuthState])

  

  // ✅ LOGIN
  const login = useCallback(
    async (credentials: LoginRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)
      

      try {
        console.log("🔄 useAuth - Iniciando login...")
        const response: AuthResponse = await authService.login(credentials)

        console.log("🎯 useAuth - Login exitoso")
        console.log("🎯 useAuth - Usuario recibido:", response.user)

        // Actualizar estado
        setUser(response.user)

        // ✅ NUEVO: Disparar evento para notificar cambio
        window.dispatchEvent(new CustomEvent("auth-updated"))

        return response
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al iniciar sesión"
        console.error("❌ useAuth - Error en login:", errorMessage)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )
  

  // ✅ REGISTER
  const register = useCallback(
    async (userData: RegisterRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response: AuthResponse = await authService.register(userData)
        setUser(response.user)

        // ✅ NUEVO: Disparar evento para notificar cambio
        window.dispatchEvent(new CustomEvent("auth-updated"))

        return response
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
  

  // ✅ LOGOUT MEJORADO
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      console.log("🔄 useAuth - Iniciando logout...")
      await authService.logout()
      setUser(null)
      setError(null)

      // ✅ NUEVO: Disparar evento para notificar cambio
      window.dispatchEvent(new CustomEvent("auth-updated"))

      console.log("✅ useAuth - Logout completado")
      window.location.href = "/"
    } catch (error) {
      console.error("❌ useAuth - Error en logout:", error)
      setUser(null)
      setError(null)
      window.location.href = "/"
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ✅ CALCULAR ESTADOS
  const isAuthenticated = !!user && authService.isAuthenticated()
  const isAdmin = user?.isAdmin === true || user?.isSuperAdmin === true

  // ✅ DEBUG LOG CUANDO CAMBIE EL ESTADO
  useEffect(() => {
    if (!loading) {
      console.log("🎯 useAuth - Estado actual:", {
        hasUser: !!user,
        userEmail: user?.email,
        userIsAdmin: user?.isAdmin,
        userIsSuperAdmin: user?.isSuperAdmin,
        calculatedIsAuthenticated: isAuthenticated,
        calculatedIsAdmin: isAdmin,
        loading,
      })
    }
  }, [user, isAuthenticated, isAdmin, loading])

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}

export default useAuth
