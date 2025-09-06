/* eslint-disable @typescript-eslint/no-explicit-any */
// services/dashboardService.ts - Siguiendo el patrón de AuthService

import { getApiUrl } from "@/config/urls"
import { DashboardFilters, DashboardStats } from "../types/ventas"

class DashboardService {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()

    if (typeof window !== "undefined") {
      console.log("📊 DashboardService initialized with baseURL:", this.baseURL)
    }
  }

  // Método helper para fetch con autenticación
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const fullUrl = getApiUrl(endpoint)

    if (typeof window !== "undefined") {
      console.log("📤 Making dashboard request to:", fullUrl)
    }

    try {
      // Obtener token del localStorage
      const token = this.getToken()

      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        credentials: "include",
        ...options,
      })

      if (typeof window !== "undefined") {
        console.log("📥 Dashboard response status:", response.status)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (typeof window !== "undefined") {
          console.log("❌ Dashboard error response:", errorData)
        }

        // Manejar errores específicos
        if (response.status === 401) {
          throw new Error("Token inválido o expirado")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para acceder al dashboard")
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
        console.log("✅ Dashboard response data:", data)
      }

      return data
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ Dashboard request failed:", error)
      }
      throw error
    }
  }

  // Obtener token del localStorage (siguiendo el patrón del authService)
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

  // Método principal para obtener estadísticas del dashboard
  async getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    console.log("📊 Obteniendo estadísticas del dashboard...")
    console.log("📊 Filtros aplicados:", filters)

    // Construir query params si hay filtros
    let endpoint = "/orders/dashboard"

    if (filters) {
      const params = new URLSearchParams()

      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.productId) params.append("productId", filters.productId)

      const queryString = params.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }

    const data = await this.makeRequest(endpoint, {
      method: "GET",
    })

    console.log("✅ Estadísticas del dashboard obtenidas:", {
      totalSales: data.sales?.length || 0,
      totalOrders: data.summary?.totalOrders || 0,
      totalRevenue: data.summary?.totalRevenue || 0,
    })

    return data as DashboardStats
  }

  // Método para obtener solo el resumen
  async getDashboardSummary(filters?: DashboardFilters) {
    const stats = await this.getDashboardStats(filters)
    return stats.summary
  }

  // Método para obtener solo las ventas por producto
  async getProductSales(filters?: DashboardFilters) {
    const stats = await this.getDashboardStats(filters)
    return stats.sales
  }
}

export const dashboardService = new DashboardService()
