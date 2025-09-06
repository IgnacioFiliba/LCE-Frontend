/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts - VERSIÓN CON URLs DINÁMICAS PARA NEXT.JS

import {
  AuthResponse,
  LoginRequest,
  RegisterData, // Cambio aquí: RegisterData en lugar de RegisterRequest
} from "@/features/register/types/register"
import { getApiUrl } from "@/config/urls" // Importar configuración dinámica

class AuthService {
  private baseURL: string

  constructor() {
    // Usar configuración dinámica en lugar de hardcoded
    this.baseURL = getApiUrl() // Esto dará la URL correcta según el entorno

    // Solo log en cliente (Next.js best practice)
    if (typeof window !== "undefined") {
      console.log("🌐 AuthService initialized with baseURL:", this.baseURL)
      console.log("🔧 Environment:", process.env.NODE_ENV)
    }
  }

  // Función para decodificar JWT
  private decodeJWT(token: string): any | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        console.error("❌ Token JWT inválido")
        return null
      }

      const payload = parts[1]
      const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4)
      const decoded = atob(paddedPayload)
      const user = JSON.parse(decoded)

      console.log("✅ Usuario decodificado del JWT:", user)
      return user
    } catch (error) {
      console.error("❌ Error decodificando JWT:", error)
      return null
    }
  }

  // Método helper para fetch con mejor manejo de errores
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    // Usar getApiUrl para cada request (URLs dinámicas)
    const fullUrl = getApiUrl(endpoint)

    if (typeof window !== "undefined") {
      console.log("📤 Making request to:", fullUrl)
      console.log("📤 Request options:", options)
    }

    try {
      // Solo agregar headers por defecto si no es FormData
      const defaultHeaders: Record<string, string> = {}
      
      if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json"
      }

      const response = await fetch(fullUrl, {
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: "include", // Para cookies si las usas
        ...options,
      })

      if (typeof window !== "undefined") {
        console.log("📥 Response status:", response.status)
        console.log("📥 Response ok:", response.ok)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (typeof window !== "undefined") {
          console.log("❌ Error response:", errorData)
        }

        // Manejar errores específicos
        if (response.status === 401) {
          throw new Error("Credenciales inválidas")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde")
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()

      if (typeof window !== "undefined") {
        console.log("✅ Response data:", data)
      }

      return data
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ Request failed:", error)
      }
      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("📤 DATOS QUE ESTOY ENVIANDO:", credentials)
    console.log("📤 URL COMPLETA:", getApiUrl("/auth/signin")) // URLs dinámicas

    const data = await this.makeRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    console.log("🔍 RESPUESTA COMPLETA DEL BACKEND:", data)

    // Buscar token en el orden correcto (access_Token es el que viene de tu API)
    const token =
      data.access_Token || data.accessToken || data.token || data.access_token
    console.log("🔍 TOKEN EXTRAÍDO:", token ? "TOKEN_FOUND" : "NO_TOKEN")

    let user = data.user || null
    console.log("🔍 USER DESDE RESPONSE:", user)

    // Si no viene user, lo decodificamos del token
    if (!user && token) {
      user = this.decodeJWT(token)
      console.log("🔍 USER DECODIFICADO DEL JWT:", user)
    }

    // Validar que tenemos los datos necesarios
    if (!token) {
      console.error("❌ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA")
      throw new Error("No se recibió token de autenticación")
    }

    if (!user) {
      console.error("❌ NO SE ENCONTRÓ USER EN LA RESPUESTA")
      throw new Error("No se recibieron datos del usuario")
    }

    // Guardar token y user
    this.saveToken(token)
    this.saveUser(user)

    console.log("✅ Token y usuario guardados correctamente")
    console.log("🎯 Usuario final:", {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })

    // Retornar en el formato que espera tu hook
    const result: AuthResponse = {
      token,
      user,
    }

    return result
  }

  async register(userData: RegisterData): Promise<any> {
  console.log("📤 REGISTRANDO CON:", userData)
  console.log("📤 URL REGISTER:", getApiUrl("/auth/register")) // URLs dinámicas
  let requestOptions: RequestInit
  if (userData instanceof FormData) {
    // Para FormData, no usar JSON.stringify ni agregar Content-Type
    requestOptions = {
      method: "POST",
      body: userData, // FormData directamente
    }
    console.log("📤 Enviando FormData con archivo")
    
    // Debug para FormData
    for (const [key, value] of userData.entries()) {
      console.log(`FormData ${key}:`, typeof value === 'object' ? value.constructor.name : value)
    }
  } else {
    // Para objeto regular usar JSON
    requestOptions = {
      method: "POST",
      body: JSON.stringify(userData),
    }
    console.log("📤 Enviando JSON sin archivo")
  }
  const data = await this.makeRequest("/auth/register", requestOptions)
  console.log("✅ REGISTER RESPONSE:", data)
  // No esperar token ni usuario, solo devolver la respuesta del backend
  return data
}

  // Función logout con URLs dinámicas
  async logout(): Promise<void> {
    const token = this.getToken()

    if (token) {
      try {
        console.log("🔄 Cerrando sesión en el backend...")

        await this.makeRequest("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("✅ Sesión cerrada correctamente en el backend")
      } catch (error) {
        console.warn("⚠️ Error cerrando sesión en backend:", error)
        // No lanzar error aquí, seguir con la limpieza local
      }
    }

    // Limpiar datos locales siempre
    this.removeToken()
    this.removeUser()
    console.log("🧹 Datos locales limpiados")
  }

  // Método mejorado para verificar autenticación
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()

    console.log("🔍 isAuthenticated check:", {
      hasToken: !!token,
      hasUser: !!user,
      userIsAdmin: user?.isAdmin,
    })

    if (!token || !user) {
      console.log("❌ No hay token o usuario")
      return false
    }

    // Verificar que el token no haya expirado
    try {
      const decodedToken = this.decodeJWT(token)
      if (!decodedToken) {
        console.log("❌ No se pudo decodificar el token")
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000)
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log("❌ Token expirado")
        this.removeToken()
        this.removeUser()
        return false
      }

      console.log("✅ Usuario autenticado correctamente")
      return true
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error)
      return false
    }
  }

  // Métodos de storage (mejorados)
  saveToken(token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
        console.log("✅ Token guardado en localStorage")
      }
    } catch (error) {
      console.error("Error saving token:", error)
    }
  }

  getToken(): string | null {
    try {
      if (typeof window === "undefined") return null

      const token = localStorage.getItem("token")
      if (!token || token === "undefined" || token === "null") {
        return null
      }
      return token
    } catch (error) {
      console.error("Error getting token:", error)
      return null
    }
  }

  removeToken(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("authToken") // Limpiar también authToken si existe
      }
    } catch (error) {
      console.error("Error removing token:", error)
    }
  }

  saveUser(user: any): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user))
        console.log("✅ Usuario guardado en localStorage:", {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        })
      }
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  getUser(): any | null {
    try {
      if (typeof window === "undefined") return null

      const userData = localStorage.getItem("user")

      if (!userData || userData === "undefined" || userData === "null") {
        console.log("❌ No hay datos de usuario en localStorage")
        return null
      }

      const user = JSON.parse(userData)
      console.log("✅ Usuario recuperado de localStorage:", {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      })

      return user
    } catch (error) {
      console.error("Error parsing user data:", error)
      this.removeUser()
      this.removeToken()
      return null
    }
  }

  removeUser(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeUser("user")
      }
    } catch (error) {
      console.error("Error removing user:", error)
    }
  }

  // Método auxiliar para verificar si es admin
  isAdmin(): boolean {
    try {
      const user = this.getUser()
      const isAdminResult =
        user?.isAdmin === true || user?.isSuperAdmin === true
      console.log("🔍 isAdmin check:", {
        user: user,
        isAdmin: user?.isAdmin,
        isSuperAdmin: user?.isSuperAdmin,
        result: isAdminResult,
      })
      return isAdminResult
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }
}

export const authService = new AuthService()