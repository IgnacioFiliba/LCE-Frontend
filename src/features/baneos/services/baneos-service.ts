/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApiUrl } from "@/config/urls"
import { ToggleBanResponse, UsersResponse } from "../types/baneos"

class UserService {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()

    if (typeof window !== "undefined") {
      console.log("🌐 UserService initialized with baseURL:", this.baseURL)
    }
  }

  // Helper para obtener token
  private getToken(): string | null {
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

  // Método helper para fetch con mejor manejo de errores (siguiendo tu patrón)
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const fullUrl = getApiUrl(endpoint)

    if (typeof window !== "undefined") {
      console.log("📤 Making request to:", fullUrl)
    }

    try {
      const token = this.getToken()

      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        credentials: "include",
        ...options,
      })

      if (typeof window !== "undefined") {
        console.log("📥 Response status:", response.status)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Manejar errores específicos (siguiendo tu patrón)
        if (response.status === 401) {
          throw new Error("No tienes autorización para realizar esta acción")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para banear usuarios")
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

  async toggleUserBan(userId: string): Promise<ToggleBanResponse> {
    console.log("📤 Toggle ban for user:", userId)

    const data = await this.makeRequest(`/users/${userId}/toggle-ban`, {
      method: "PUT",
    })

    console.log("✅ Toggle ban response:", data)
    return data
  }

  async getUsers(): Promise<UsersResponse> {
    console.log("📤 Getting users list")

    const data = await this.makeRequest("/users", {
      method: "GET",
    })

    console.log("✅ Users response:", data)
    return data
  }
}

export const userService = new UserService()
