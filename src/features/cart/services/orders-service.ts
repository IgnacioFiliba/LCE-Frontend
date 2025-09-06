/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orders-service.ts

import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

// ✅ FUNCIÓN HELPER MEJORADA PARA OBTENER HEADERS CON AUTENTICACIÓN
const getAuthHeaders = () => {
  // ✅ PROTEGER LOCALSTORAGE PARA NEXT.JS
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("authToken")
      : null

  // ✅ SOLO LOGS EN CLIENTE
  if (typeof window !== "undefined") {
    console.log("🔑 Token encontrado:", !!token) // Debug
    console.log(
      "🔑 Token (primeros 20 chars):",
      token ? token.substring(0, 20) + "..." : "No token"
    ) // Debug
    console.log("🔗 Using API:", getApiUrl()) // Debug - URLs dinámicas
  }

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const ordersService = {
  // Obtener órdenes por ID de usuario - ENDPOINT /orders/{id}
  getOrdersByUserId: async (userId: string) => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/${userId}`)
      console.log("🔗 Calling orders API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Orders response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting user orders:", errorData)

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
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const orders = await response.json()
      console.log("✅ User orders retrieved:", orders.length || 0)
      return orders
    } catch (error) {
      console.error("❌ Error fetching user orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string) => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/single/${orderId}`)
      console.log("🔗 Calling single order API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Single order response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting single order:", errorData)

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
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const order = await response.json()
      console.log("✅ Single order retrieved:", order.id)
      return order
    } catch (error) {
      console.error("❌ Error fetching order:", error)
      throw error
    }
  },

  // Crear nueva orden (corregido con autenticación)
  createOrder: async (orderData: any) => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl("/orders")
      console.log("🔗 Calling create order API:", url)
      console.log("📦 Order data:", orderData)

      const headers = getAuthHeaders()

      if (typeof window !== "undefined") {
        console.log("🔑 Headers being sent:", headers) // Debug
      }

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(orderData),
      })

      console.log("📡 Create order response status:", response.status)

      if (!response.ok) {
        // ✅ MEJORADO: Obtener detalles del error
        let errorDetails
        try {
          errorDetails = await response.json()
        } catch {
          errorDetails = { message: "Error de conexión" }
        }

        console.error("❌ Create order error details:", errorDetails)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para crear órdenes.")
        }
        if (response.status === 400) {
          throw new Error(errorDetails.message || "Datos de orden inválidos.")
        }
        if (response.status === 409) {
          throw new Error(
            errorDetails.message ||
              "Conflicto al crear la orden. Algunos productos no están disponibles."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorDetails.message || "Unknown error"
          }`
        )
      }

      const result = await response.json()
      console.log("✅ Order created successfully:", result.id)
      return result
    } catch (error) {
      console.error("❌ Error creating order:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Cancelar orden
  cancelOrder: async (orderId: string, reason?: string) => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/${orderId}/cancel`)
      console.log("🔗 Calling cancel order API:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: reason ? JSON.stringify({ reason }) : undefined,
      })

      console.log("📡 Cancel order response status:", response.status)

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
            errorData.message ||
              "No se puede cancelar una orden que ya fue procesada."
          )
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Order canceled successfully:", result.id)
      return result
    } catch (error) {
      console.error("❌ Error canceling order:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Obtener historial de órdenes con paginación
  getOrdersHistory: async (
    userId: string,
    options: {
      page?: number
      limit?: number
      status?: string
      dateFrom?: string
      dateTo?: string
    } = {}
  ) => {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = options

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // ✅ AGREGAR FILTROS OPCIONALES
      if (status) params.append("status", status)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/orders/${userId}/history?${params.toString()}`)
      console.log("🔗 Calling orders history API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Orders history response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting orders history:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error(
            "No tienes permisos para ver el historial de órdenes."
          )
        }
        if (response.status === 404) {
          throw new Error("Usuario no encontrado.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Orders history retrieved:", result.orders?.length || 0)
      return result
    } catch (error) {
      console.error("❌ Error fetching orders history:", error)
      throw error
    }
  },

  // ✅ BONUS: Actualizar estado de orden
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const url = getApiUrl(`/orders/${orderId}/status`)
      console.log("🔗 Calling update order status API:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      console.log("📡 Update status response:", response.status)

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
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log(
        "✅ Order status updated successfully:",
        result.id,
        "→",
        status
      )
      return result
    } catch (error) {
      console.error("❌ Error updating order status:", error)
      throw error
    }
  },

  // ✅ BONUS: Reordenar (crear orden basada en una anterior)
  reorder: async (originalOrderId: string) => {
    try {
      const url = getApiUrl(`/orders/${originalOrderId}/reorder`)
      console.log("🔗 Calling reorder API:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Reorder response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error reordering:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 404) {
          throw new Error("Orden original no encontrada.")
        }
        if (response.status === 409) {
          throw new Error(
            errorData.message || "Algunos productos ya no están disponibles."
          )
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Reorder successful:", result.id)
      return result
    } catch (error) {
      console.error("❌ Error reordering:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener tracking de orden
  getOrderTracking: async (orderId: string) => {
    try {
      const url = getApiUrl(`/orders/${orderId}/tracking`)
      console.log("🔗 Calling order tracking API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Tracking response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting tracking:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 404) {
          throw new Error("Información de tracking no encontrada.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log(
        "✅ Tracking info retrieved:",
        result.trackingNumber || "No tracking number"
      )
      return result
    } catch (error) {
      console.error("❌ Error getting tracking:", error)
      throw error
    }
  },
}
