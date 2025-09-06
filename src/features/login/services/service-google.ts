/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleAuthResponse } from "../types/login-google"
import { getApiUrl } from "@/config/urls"

export class GoogleAuthService {
  private readonly STORAGE_KEYS = {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER: "user",
    EXPIRES_AT: "token_expires_at",
  }

  private readonly ENDPOINTS = {
    GOOGLE_AUTH: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    PROFILE: "/auth/profile",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
  }

  private refreshInterval?: NodeJS.Timeout

  constructor() {
    if (typeof window !== "undefined") {
      console.log("🔐 GoogleAuthService initialized with baseURL:", getApiUrl())
      this.setupPeriodicTokenRefresh()
    }
  }

  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Obtiene el token almacenado
   */
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.STORAGE_KEYS.AUTH_TOKEN)
  }

  /**
   * Verifica si el token está próximo a expirar
   */
  private isTokenExpiringSoon(): boolean {
    if (typeof window === "undefined") return false

    const expiresAt = localStorage.getItem(this.STORAGE_KEYS.EXPIRES_AT)
    if (!expiresAt) return false

    const expirationTime = parseInt(expiresAt)
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return expirationTime - currentTime <= fiveMinutes
  }

  /**
   * Configura la renovación automática de tokens
   */
  private setupPeriodicTokenRefresh(): void {
    // Limpiar interval anterior si existe
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(async () => {
      if (this.getStoredToken() && this.isTokenExpiringSoon()) {
        try {
          await this.refreshAccessToken()
          console.log("🔄 Token renovado automáticamente")
        } catch (error) {
          console.warn("⚠️ Error en renovación automática de token:", error)
        }
      }
    }, 60000) // Verificar cada minuto
  }

  // ==================== AUTHENTICATION FLOW ====================

  /**
   * Inicia el flujo de autenticación con Google (usando backend)
   */
  initiateGoogleAuth(): void {
    if (typeof window === "undefined") return

    try {
      const currentOrigin = window.location.origin
      const redirectUri = `${currentOrigin}/auth/callback`

      console.log("🌐 Current origin:", currentOrigin)
      console.log("🔄 Redirect URI:", redirectUri)

      const url = getApiUrl(this.ENDPOINTS.GOOGLE_AUTH)
      const urlWithParams = new URL(url)
      urlWithParams.searchParams.append("redirect_uri", redirectUri)

      console.log("🔗 Iniciando Google Auth:", urlWithParams.toString())

      // Guardar el estado antes de la redirección
      this.saveAuthState()

      window.location.href = urlWithParams.toString()
    } catch (error) {
      console.error("❌ Error iniciando Google Auth:", error)
      throw error
    }
  }

  /**
   * Inicia autenticación directa con Google (sin backend intermedio)
   */
  initiateGoogleAuthDirect(): void {
    if (typeof window === "undefined") return

    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

      if (!googleClientId) {
        throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado")
      }

      const currentOrigin = window.location.origin
      const redirectUri = `${currentOrigin}/auth/callback`

      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      )

      // Parámetros requeridos
      googleAuthUrl.searchParams.append("client_id", googleClientId)
      googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
      googleAuthUrl.searchParams.append("response_type", "code")
      googleAuthUrl.searchParams.append("scope", "openid email profile")
      googleAuthUrl.searchParams.append("access_type", "offline")
      googleAuthUrl.searchParams.append("prompt", "select_account")

      // State para seguridad CSRF
      const state = this.generateSecureState()
      googleAuthUrl.searchParams.append("state", state)

      console.log("🔗 Google Auth URL:", googleAuthUrl.toString())

      // Guardar state y iniciar flujo
      this.saveAuthState(state)
      window.location.href = googleAuthUrl.toString()
    } catch (error) {
      console.error("❌ Error construyendo URL de Google:", error)
      throw error
    }
  }

  /**
   * Genera un state seguro para CSRF protection
   */
  private generateSecureState(): string {
    const state = {
      timestamp: Date.now(),
      origin: typeof window !== "undefined" ? window.location.origin : "",
      nonce: Math.random().toString(36).substring(2, 15),
    }
    return btoa(JSON.stringify(state))
  }

  /**
   * Guarda el estado de autenticación antes de la redirección
   */
  private saveAuthState(state?: string): void {
    if (typeof window === "undefined") return

    const authState = {
      timestamp: Date.now(),
      returnUrl: window.location.pathname + window.location.search,
      ...(state && { state }),
    }

    sessionStorage.setItem("auth_state", JSON.stringify(authState))
  }

  /**
   * Recupera y limpia el estado de autenticación
   */
  private getAndClearAuthState(): any {
    if (typeof window === "undefined") return null

    const authState = sessionStorage.getItem("auth_state")
    if (authState) {
      sessionStorage.removeItem("auth_state")
      try {
        return JSON.parse(authState)
      } catch (error) {
        console.error("❌ Error parseando auth state:", error)
        return null
      }
    }

    return null
  }

  // ==================== CALLBACK HANDLING ====================

  /**
   * Maneja el callback después de la autenticación con Google
   */
  async handleGoogleCallback(
    code: string,
    state?: string
  ): Promise<GoogleAuthResponse> {
    try {
      console.log("🔑 Processing Google callback...")

      if (!code) {
        throw new Error("Código de autorización no recibido de Google")
      }

      // Validar state si existe
      if (state) {
        this.validateState(state)
      }

      const url = getApiUrl(this.ENDPOINTS.GOOGLE_CALLBACK)
      console.log("🔗 Procesando callback:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code,
          ...(state && { state }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(this.getErrorMessage(response.status, errorData))
      }

      const data: GoogleAuthResponse = await response.json()
      console.log("✅ Google auth successful")

      // Guardar datos de autenticación
      await this.saveAuthData(data)

      return data
    } catch (error) {
      console.error("❌ Error en Google callback:", error)
      throw error
    }
  }

  /**
   * Valida el state parameter para prevenir CSRF
   */
  private validateState(state: string): void {
    try {
      const stateData = JSON.parse(atob(state))
      const currentOrigin =
        typeof window !== "undefined" ? window.location.origin : ""

      if (stateData.origin !== currentOrigin) {
        throw new Error("State parameter inválido - posible ataque CSRF")
      }

      const tenMinutes = 10 * 60 * 1000
      if (Date.now() - stateData.timestamp > tenMinutes) {
        throw new Error("State parameter expirado")
      }

      console.log("✅ State parameter validado")
    } catch (error) {
      console.error("❌ Error validando state:", error)
      throw new Error("Parámetro de estado inválido")
    }
  }

  /**
   * Guarda los datos de autenticación en el almacenamiento local
   */
  private async saveAuthData(data: any): Promise<void> {
    if (typeof window === "undefined") return

    try {
      if (data.token) {
        localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, data.token)

        // Calcular tiempo de expiración (default 1 hora si no se especifica)
        const expiresIn = data.expiresIn || data.expires_in || 3600 // segundos
        const expiresAt = Date.now() + expiresIn * 1000
        localStorage.setItem(this.STORAGE_KEYS.EXPIRES_AT, expiresAt.toString())

        console.log("💾 Auth token guardado")
      }

      if (data.refreshToken || data.refresh_token) {
        const storedRefreshToken = data.refreshToken || data.refresh_token
        localStorage.setItem(
          this.STORAGE_KEYS.REFRESH_TOKEN,
          storedRefreshToken
        )
        console.log("💾 Refresh token guardado")
      }

      if (data.user) {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user))
        console.log("💾 Datos de usuario guardados")
      }
    } catch (error) {
      console.error("❌ Error guardando datos de auth:", error)
      throw error
    }
  }

  // ==================== USER PROFILE ====================

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getUserProfile(): Promise<GoogleAuthResponse["user"]> {
    try {
      const token = await this.getValidToken()

      const url = getApiUrl(this.ENDPOINTS.PROFILE)
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      })

      const userData = await response.json()

      // Actualizar datos de usuario en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userData))
      }

      console.log("✅ Perfil actualizado")
      return userData
    } catch (error) {
      console.error("❌ Error obteniendo perfil:", error)
      throw error
    }
  }

  /**
   * Obtiene usuario guardado en localStorage
   */
  getStoredUser(): GoogleAuthResponse["user"] | null {
    if (typeof window === "undefined") return null

    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("❌ Error parseando usuario guardado:", error)
      return null
    }
  }

  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Obtiene un token válido, renovándolo si es necesario
   */
  async getValidToken(): Promise<string> {
    const token = this.getStoredToken()

    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    // Si el token está próximo a expirar, renovarlo
    if (this.isTokenExpiringSoon()) {
      try {
        return await this.refreshAccessToken()
      } catch (error) {
        console.error("❌ Error renovando token:", error)
        throw new Error("Token expirado y no se pudo renovar")
      }
    }

    return token
  }

  /**
   * Renueva el token de acceso
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const storedRefreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN)
          : null

      if (!storedRefreshToken) {
        throw new Error("No hay refresh token disponible")
      }

      const url = getApiUrl(this.ENDPOINTS.REFRESH)
      console.log("🔗 Refrescando token...")

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.logout()
          throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al refrescar token")
      }

      const responseData = await response.json()
      const {
        token,
        expiresIn,
        expires_in,
        refreshToken: newRefreshToken,
        refresh_token,
      } = responseData

      if (typeof window !== "undefined") {
        localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, token)

        if (expiresIn || expires_in) {
          const tokenExpiresIn = expiresIn || expires_in
          const expiresAt = Date.now() + tokenExpiresIn * 1000
          localStorage.setItem(
            this.STORAGE_KEYS.EXPIRES_AT,
            expiresAt.toString()
          )
        }
      }

      console.log("✅ Token renovado exitosamente")
      return token
    } catch (error) {
      console.error("❌ Error renovando token:", error)
      throw error
    }
  }

  // ==================== AUTHENTICATION STATUS ====================

  /**
   * Verifica si el token actual es válido
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const token = this.getStoredToken()
      if (!token) return false

      const url = getApiUrl(this.ENDPOINTS.VERIFY)
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      })

      return response.ok
    } catch (error) {
      console.error("❌ Error verificando token:", error)
      return false
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = this.getStoredToken()
    if (!token) return false

    // Si el token está próximo a expirar, intentar renovarlo
    if (this.isTokenExpiringSoon()) {
      try {
        await this.refreshAccessToken()
        return true
      } catch (error) {
        await this.logout()
        return false
      }
    }

    return await this.isTokenValid()
  }

  // ==================== LOGOUT ====================

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken()

      if (token) {
        try {
          const url = getApiUrl(this.ENDPOINTS.LOGOUT)
          await this.makeAuthenticatedRequest(url, {
            method: "POST",
          })
          console.log("✅ Sesión cerrada en backend")
        } catch (error) {
          console.warn("⚠️ Error cerrando sesión en backend:", error)
        }
      }
    } finally {
      this.clearAuthData()
    }
  }

  /**
   * Limpia todos los datos de autenticación
   */
  private clearAuthData(): void {
    if (typeof window === "undefined") return

    // Limpiar interval de renovación
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = undefined
    }

    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })

    // También limpiar sessionStorage
    sessionStorage.removeItem("auth_state")
    console.log("🧹 Datos de autenticación eliminados")
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Realiza una petición autenticada
   */
  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getValidToken()

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    })

    if (response.status === 401) {
      await this.logout()
      throw new Error("Sesión expirada. Inicia sesión nuevamente.")
    }

    return response
  }

  /**
   * Extrae parámetros de la URL de callback
   */
  extractCallbackParams(): { code?: string; state?: string; error?: string } {
    if (typeof window === "undefined") return {}

    const urlParams = new URLSearchParams(window.location.search)
    return {
      code: urlParams.get("code") || undefined,
      state: urlParams.get("state") || undefined,
      error: urlParams.get("error") || undefined,
    }
  }

  /**
   * Verifica si estamos en una página de callback
   */
  isCallbackPage(): boolean {
    if (typeof window === "undefined") return false

    const path = window.location.pathname
    const hasCode = window.location.search.includes("code=")

    return (
      (path.includes("/auth/callback") || path.includes("/callback")) && hasCode
    )
  }

  /**
   * Obtiene información del estado de autenticación
   */
  getAuthInfo(): {
    hasToken: boolean
    hasRefreshToken: boolean
    hasUser: boolean
    isExpiringSoon: boolean
    user: GoogleAuthResponse["user"] | null
  } {
    if (typeof window === "undefined") {
      return {
        hasToken: false,
        hasRefreshToken: false,
        hasUser: false,
        isExpiringSoon: false,
        user: null,
      }
    }

    return {
      hasToken: !!this.getStoredToken(),
      hasRefreshToken: !!localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN),
      hasUser: !!localStorage.getItem(this.STORAGE_KEYS.USER),
      isExpiringSoon: this.isTokenExpiringSoon(),
      user: this.getStoredUser(),
    }
  }

  /**
   * Obtiene mensaje de error amigable basado en el status HTTP
   */
  private getErrorMessage(status: number, errorData: any): string {
    switch (status) {
      case 400:
        if (errorData.message?.includes("redirect_uri")) {
          return "Error de configuración: redirect_uri no coincide. Contacta al administrador."
        }
        return "Código de autorización inválido o expirado."
      case 401:
        return "Error de autenticación con Google."
      case 403:
        return "No tienes permisos para realizar esta acción."
      case 429:
        return "Demasiadas solicitudes. Intenta de nuevo en unos minutos."
      case 500:
        return "Error interno del servidor durante la autenticación."
      default:
        return (
          errorData.message ||
          `Error ${status}: ${errorData.statusText || "Error desconocido"}`
        )
    }
  }

  /**
   * Debug helper para verificar configuración
   */
  debugConfig(): void {
    if (typeof window === "undefined") {
      console.log("🔍 DEBUG: Ejecutándose en servidor")
      return
    }

    console.log("🔍 DEBUG - Google Auth Configuration:")
    console.log("📍 Current URL:", window.location.href)
    console.log("🌐 Origin:", window.location.origin)
    console.log("🔗 API Base URL:", getApiUrl())
    console.log("🔑 Auth Info:", this.getAuthInfo())
    console.log("📄 Is Callback Page:", this.isCallbackPage())
    console.log("🌍 Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        ? "SET"
        : "NOT SET",
    })

    if (this.isCallbackPage()) {
      console.log("🔄 Callback Params:", this.extractCallbackParams())
    }

    const authState = sessionStorage.getItem("auth_state")
    if (authState) {
      console.log("💾 Auth State:", JSON.parse(authState))
    }
  }
}

// Instancia singleton
export const googleAuthService = new GoogleAuthService()
