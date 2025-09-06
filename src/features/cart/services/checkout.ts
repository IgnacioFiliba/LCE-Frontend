import { Order, OrdersResponse } from "../types/checkout"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

// ✅ HELPER PARA OBTENER TOKEN DE FORMA SEGURA
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// ✅ HELPER PARA HEADERS CON AUTH
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const ordersService = {
  // Obtener órdenes por ID de usuario
  getOrdersByUserId: async (userId: string): Promise<OrdersResponse> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/${userId}`)
      console.log("🔗 Obteniendo órdenes del usuario:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include", // ✅ AGREGAR PARA COOKIES
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(
          "❌ Error en getOrdersByUserId:",
          response.status,
          errorData
        )

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver estas órdenes.")
        }
        if (response.status === 404) {
          throw new Error("Usuario no encontrado.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Órdenes obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Error fetching orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/single/${orderId}`)
      console.log("🔗 Obteniendo orden específica:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en getOrderById:", response.status, errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver esta orden.")
        }
        if (response.status === 404) {
          throw new Error("Orden no encontrada.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Orden obtenida:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error fetching order:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Crear una nueva orden
  createOrder: async (orderData: {
    userId: string
    products: Array<{
      productId: string
      quantity: number
      price: number
    }>
    totalAmount: number
    shippingAddress?: string
  }): Promise<Order> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl("/orders")
      console.log("🔗 Creando orden:", url)
      console.log("📦 Datos de la orden:", {
        userId: orderData.userId,
        productsCount: orderData.products.length,
        totalAmount: orderData.totalAmount,
      })

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(orderData),
      })

      console.log("📥 Create order response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error creating order:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 400) {
          throw new Error(errorData.message || "Datos de orden inválidos.")
        }
        if (response.status === 409) {
          throw new Error(
            "Conflicto al crear la orden. Algunos productos no están disponibles."
          )
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Orden creada exitosamente:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error creating order:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Actualizar estado de orden
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<Order> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/${orderId}/status`)
      console.log("🔗 Actualizando estado de orden:", url)
      console.log("📝 Nuevo estado:", status)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      console.log("📥 Update status response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error updating order status:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para actualizar órdenes.")
        }
        if (response.status === 404) {
          throw new Error("Orden no encontrada.")
        }
        if (response.status === 400) {
          throw new Error(errorData.message || "Estado de orden inválido.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Estado de orden actualizado:", data.id, "→", status)
      return data
    } catch (error) {
      console.error("❌ Error updating order status:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Obtener todas las órdenes (para admin)
  getAllOrders: async (params?: {
    page?: number
    limit?: number
    status?: string
    userId?: string
  }): Promise<OrdersResponse> => {
    try {
      // ✅ CONSTRUIR QUERY PARAMS SI SE PROPORCIONAN
      let url = getApiUrl("/orders")

      if (params) {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append("page", params.page.toString())
        if (params.limit) queryParams.append("limit", params.limit.toString())
        if (params.status) queryParams.append("status", params.status)
        if (params.userId) queryParams.append("userId", params.userId)

        const queryString = queryParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }

      console.log("🔗 Obteniendo todas las órdenes:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📥 Get all orders response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting all orders:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver todas las órdenes.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Todas las órdenes obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Error getting all orders:", error)
      throw error
    }
  },

  // ✅ BONUS: Cancelar orden
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    try {
      const url = getApiUrl(`/orders/${orderId}/cancel`)
      console.log("🔗 Cancelando orden:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error canceling order:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para cancelar esta orden.")
        }
        if (response.status === 404) {
          throw new Error("Orden no encontrada.")
        }
        if (response.status === 409) {
          throw new Error(
            "No se puede cancelar una orden que ya fue procesada."
          )
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Orden cancelada exitosamente:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error canceling order:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener estadísticas de órdenes (para admin)
  getOrderStats: async (): Promise<{
    totalOrders: number
    totalRevenue: number
    ordersByStatus: Record<string, number>
    recentOrders: Order[]
  }> => {
    try {
      const url = getApiUrl("/orders/stats")
      console.log("🔗 Obteniendo estadísticas de órdenes:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting order stats:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver estadísticas.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Estadísticas obtenidas:", {
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
      })
      return data
    } catch (error) {
      console.error("❌ Error getting order stats:", error)
      throw error
    }
  },
}
