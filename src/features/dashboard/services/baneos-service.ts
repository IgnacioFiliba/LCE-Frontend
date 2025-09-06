/* eslint-disable @typescript-eslint/no-explicit-any */
// services/userActionsService.ts
import { getApiUrl } from "@/config/urls"
import { UserActionResponse } from "../types/baneos"


class UserActionsService {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()
    
    if (typeof window !== "undefined") {
      console.log("👤 UserActionsService initialized with baseURL:", this.baseURL)
      console.log("🔧 Environment:", process.env.NODE_ENV)
    }
  }

  // Método helper para obtener el token de auth
  private getAuthToken(): string | null {
    try {
      if (typeof window === "undefined") return null
      return localStorage.getItem("token")
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  // Método helper para fetch con autenticación
  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const fullUrl = getApiUrl(endpoint)
    const token = this.getAuthToken()

    if (typeof window !== "undefined") {
      console.log("📤 Making authenticated request to:", fullUrl)
      console.log("📤 Has token:", !!token)
    }

    if (!token) {
      throw new Error("No se encontró token de autenticación")
    }

    try {
      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...options.headers,
        },
        credentials: "include",
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
          throw new Error("No tienes autorización para realizar esta acción")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos de administrador")
        }
        if (response.status === 404) {
          throw new Error("Usuario no encontrado")
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
        console.log("✅ User action response data:", data)
      }

      return data
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ User action request failed:", error)
      }
      throw error
    }
  }

  // Método para banear/desbanear usuario
  async toggleBan(userId: string): Promise<UserActionResponse> {
    console.log("🚫 Toggling ban for user:", userId)
    console.log("📤 URL:", getApiUrl(`/users/${userId}/toggle-ban`))

    try {
      const data = await this.makeAuthenticatedRequest(`/users/${userId}/toggle-ban`, {
        method: "PUT",
      })

      console.log("✅ Ban toggle successful:", {
        userId: data.user?.id,
        isBanned: data.user?.isBanned,
        message: data.message,
      })

      return data
    } catch (error) {
      console.error("❌ Error toggling ban:", error)
      throw error
    }
  }

  // Método para dar/quitar permisos de admin
  async toggleAdmin(userId: string): Promise<UserActionResponse> {
    console.log("👑 Toggling admin for user:", userId)
    console.log("📤 URL:", getApiUrl(`/users/${userId}/toggle-admin`))

    try {
      const data = await this.makeAuthenticatedRequest(`/users/${userId}/toggle-admin`, {
        method: "PUT",
      })

      console.log("✅ Admin toggle successful:", {
        userId: data.user?.id,
        isAdmin: data.user?.isAdmin,
        message: data.message,
      })

      return data
    } catch (error) {
      console.error("❌ Error toggling admin:", error)
      throw error
    }
  }

  // Método auxiliar para verificar si el usuario actual puede gestionar usuarios
  canManageUsers(): boolean {
    try {
      if (typeof window === "undefined") return false
      
      const userData = localStorage.getItem("user")
      if (!userData) return false
      
      const user = JSON.parse(userData)
      const canManage = user?.isAdmin === true || user?.isSuperAdmin === true
      
      console.log("🔍 Can manage users check:", {
        isAdmin: user?.isAdmin,
        isSuperAdmin: user?.isSuperAdmin,
        result: canManage,
      })
      
      return canManage
    } catch (error) {
      console.error("Error checking user management permissions:", error)
      return false
    }
  }

  // Método para verificar si puede promover/degradar admins (solo SuperAdmin)
  canManageAdmins(): boolean {
    try {
      if (typeof window === "undefined") return false
      
      const userData = localStorage.getItem("user")
      if (!userData) return false
      
      const user = JSON.parse(userData)
      const canManageAdmins = user?.isSuperAdmin === true
      
      console.log("🔍 Can manage admins check:", {
        isSuperAdmin: user?.isSuperAdmin,
        result: canManageAdmins,
      })
      
      return canManageAdmins
    } catch (error) {
      console.error("Error checking admin management permissions:", error)
      return false
    }
  }

  // Métodos auxiliares para obtener estado de baneo
  getUserBanStatus(user: any): boolean {
    return user?.isBanned === true
  }

  getUserAdminStatus(user: any): boolean {
    return user?.isAdmin === true
  }

  // Métodos para obtener mensajes apropiados
  getBanActionMessage(isBanned: boolean): string {
    return isBanned ? "Desbanear usuario" : "Banear usuario"
  }

  getAdminActionMessage(isAdmin: boolean): string {
    return isAdmin ? "Quitar permisos de Admin" : "Dar permisos de Admin"
  }

  // Método para obtener el estado visual apropiado para baneos
  getBanStatusDisplay(isBanned: boolean): {
    status: string
    variant: "default" | "destructive" | "secondary"
    text: string
  } {
    if (isBanned) {
      return {
        status: "banned",
        variant: "destructive",
        text: "Baneado"
      }
    }
    
    return {
      status: "active",
      variant: "default", 
      text: "Activo"
    }
  }

  // Método para obtener el estado visual apropiado para admin
  getAdminStatusDisplay(isAdmin: boolean): {
    status: string
    variant: "default" | "destructive" | "secondary"
    text: string
  } {
    if (isAdmin) {
      return {
        status: "admin",
        variant: "secondary",
        text: "Admin"
      }
    }
    
    return {
      status: "user",
      variant: "default", 
      text: "Usuario"
    }
  }
}

export const userActionsService = new UserActionsService()