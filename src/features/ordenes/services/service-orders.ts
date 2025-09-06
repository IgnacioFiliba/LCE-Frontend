/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orderService.ts

import {
  GetOrdersParams,
  OrdersResponse,
  OrderStats,
  ApiResponse,
  Order,
  CreateOrderRequest,
  OrderStatus,
  UpdateOrderStatusRequest,
} from "../types/orders"
import { authService } from "@/features/login/services/login-service"
import { getApiUrl } from "@/config/urls"

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()

    if (typeof window !== "undefined") {
      console.log(
        "OrderService ApiClient initialized with baseURL:",
        this.baseURL
      )
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Obtener token antes de construir headers
    const token = authService.getToken()

    const config: RequestInit = {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Si hay token, agregar Authorization header
        ...(token && { Authorization: `Bearer ${token}` }),
        // Agregar headers adicionales si vienen en options
        ...options.headers,
      },
    }

    if (typeof window !== "undefined") {
      console.log("Making request to:", url)
      console.log("Has token:", !!token)
      console.log("User is admin:", authService.isAdmin())
      console.log("Headers being sent:", config.headers)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        console.error("Response not OK:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          headers: config.headers,
        })

        const errorData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          console.error(
            "Authentication failed - redirecting to login might be needed"
          )
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          console.error(
            "Access forbidden - user might not have admin permissions"
          )
          console.error("Token present:", !!token)
          console.error("Is admin:", authService.isAdmin())
          throw new Error("No tienes permisos para acceder a las órdenes.")
        }
        if (response.status === 404) {
          throw new Error("Recurso no encontrado.")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : ""
    return this.request<T>(`${endpoint}${queryParams}`, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

// Crear instancia única sin parámetros
const apiClient = new ApiClient()

export class OrderService {
  /**
   * Obtener todas las órdenes (solo admin)
   * GET /orders
   */
  static async getOrders(
    params: GetOrdersParams = {}
  ): Promise<OrdersResponse> {
    // Verificar autenticación antes de hacer la petición
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver las órdenes")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para ver todas las órdenes"
      )
    }

    // DEBUG: Verificar datos de auth
    console.log("Auth check:", {
      isAuthenticated: authService.isAuthenticated(),
      isAdmin: authService.isAdmin(),
      hasToken: !!authService.getToken(),
    })

    // Llamar sin parámetros como necesita tu backend
    return apiClient.get<OrdersResponse>("/orders", params)
  }

  /**
   * Obtener estadísticas de ventas (dashboard)
   * GET /orders/dashboard
   */
  static async getOrderStats(): Promise<OrderStats> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver las estadísticas")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para ver las estadísticas"
      )
    }

    return apiClient.get<OrderStats>("/orders/dashboard")
  }

  /**
   * Obtener una orden por su ID
   * GET /orders/{id}
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver la orden")
    }

    return apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`)
  }

  /**
   * Crear una nueva orden de compra
   * POST /orders
   */
  static async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para crear una orden")
    }

    return apiClient.post<ApiResponse<Order>>("/orders", orderData)
  }

  /**
   * Cambiar el status de una orden (solo admin)
   * PATCH /orders/{id}/status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para actualizar la orden")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para cambiar el estado de órdenes"
      )
    }

    const data: UpdateOrderStatusRequest = { status }
    if (notes) data.notes = notes

    return apiClient.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      data
    )
  }

  /**
   * Buscar órdenes por término de búsqueda
   */
  static async searchOrders(searchTerm: string): Promise<OrdersResponse> {
    return this.getOrders({
      search: searchTerm,
      limit: 50,
    })
  }

  /**
   * Filtrar órdenes por estado
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<OrdersResponse> {
    return this.getOrders({ status, limit: 100 })
  }

  /**
   * Obtener órdenes de un usuario específico
   */
  static async getUserOrders(userId: string): Promise<OrdersResponse> {
    return this.getOrders({ userId, limit: 50 })
  }

  /**
   * Obtener órdenes por rango de fechas
   */
  static async getOrdersByDateRange(
    dateFrom: string,
    dateTo: string
  ): Promise<OrdersResponse> {
    return this.getOrders({ dateFrom, dateTo })
  }

  /**
   * Aprobar orden (cambiar de "En Preparacion" a "Aprobada")
   */
  static async approveOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Aprobada", notes)
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Cancelada", notes)
  }

  /**
   * Marcar orden como entregada
   */
  static async deliverOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Entregada", notes)
  }
}

export default OrderService
