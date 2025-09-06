/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreatePaymentPreferenceRequest,
  CreatePaymentPreferenceResponse,
  PaymentFailureRequest,
  PaymentSuccessRequest,
  PaymentResponse,
} from "../types/payments"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

// ✅ FUNCIÓN HELPER MEJORADA PARA OBTENER HEADERS CON AUTENTICACIÓN
const getAuthHeaders = () => {
  // ✅ PROTEGER LOCALSTORAGE PARA NEXT.JS
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem("token") || localStorage.getItem("authToken"))
    : null

  // ✅ SOLO LOGS EN CLIENTE
  if (typeof window !== 'undefined') {
    console.log("🔑 Token encontrado:", !!token)
    console.log("🔗 Using API:", getApiUrl()) // Debug API URL dinámico
    if (token) {
      console.log("🔑 Token (primeros 20 chars):", token.substring(0, 20) + "...")
    }
  }

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const paymentsService = {
  // ✅ MEJORADO: Crear preferencia de pago con URLs dinámicas
  createPaymentPreference: async (
    cartId: string,
    additionalData?: Partial<CreatePaymentPreferenceRequest>
  ): Promise<CreatePaymentPreferenceResponse> => {
    try {
      console.log("🚀 [PAYMENT] Iniciando creación de preferencia de pago")
      console.log("🛒 [PAYMENT] CartID:", cartId)

      // ✅ USAR URLs DINÁMICAS
      const endpoint = getApiUrl(`/payments/checkout/${cartId}`)
      console.log("🔗 [PAYMENT] Endpoint:", endpoint)

      // ✅ CORREGIDO: Solo mandar additionalData, no cartId en el body
      const requestData = {
        ...additionalData, // Solo datos adicionales, no el cartId
      }

      console.log("📦 [PAYMENT] Request data:", requestData)

      // Obtener headers con logs
      const headers = getAuthHeaders()
      
      if (typeof window !== 'undefined') {
        console.log("🔑 [PAYMENT] Headers preparados:", {
          ...headers,
          Authorization: headers.Authorization
            ? headers.Authorization.substring(0, 30) + "..."
            : "No auth",
        })
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      console.log("📡 [PAYMENT] Response status:", response.status)
      console.log("📡 [PAYMENT] Response ok:", response.ok)

      // ✅ MEJORADO: Leer respuesta completa para debugging
      let responseData
      try {
        const responseText = await response.text()
        console.log("📄 [PAYMENT] Response raw text:", responseText)

        responseData = responseText ? JSON.parse(responseText) : {}
        console.log("📄 [PAYMENT] Response parsed:", responseData)
      } catch (parseError) {
        console.error("❌ [PAYMENT] Error parsing response:", parseError)
        responseData = { error: "Invalid JSON response" }
      }

      if (!response.ok) {
        console.error("❌ [PAYMENT] HTTP Error Details:")
        console.error("   Status:", response.status)
        console.error("   Status Text:", response.statusText)
        console.error("   Response Data:", responseData)

        // ✅ MEJORADO: Manejo específico de errores
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para crear pagos.")
        }
        if (response.status === 404) {
          throw new Error("Carrito no encontrado.")
        }
        if (response.status === 400) {
          throw new Error(
            responseData.message || "Datos de pago inválidos."
          )
        }
        if (response.status === 409) {
          throw new Error(
            responseData.message || "Conflicto en el carrito. Algunos productos no están disponibles."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor de pagos. Intenta de nuevo más tarde.")
        }

        const errorMessage =
          responseData.message ||
          responseData.error ||
          `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      console.log("✅ [PAYMENT] Preferencia creada exitosamente!")
      console.log("✅ [PAYMENT] Respuesta final:", responseData)

      // ✅ VALIDACIÓN: Verificar campos esperados (con ambas variantes)
      if (!responseData.initPoint && !responseData.init_point) {
        console.warn(
          "⚠️ [PAYMENT] Advertencia: No se encontró 'initPoint' ni 'init_point' en la respuesta"
        )
      }
      if (!responseData.preferenceId && !responseData.preference_id) {
        console.warn(
          "⚠️ [PAYMENT] Advertencia: No se encontró 'preferenceId' ni 'preference_id' en la respuesta"
        )
      }

      // ✅ NUEVO: Agregar campo 'ok' si no existe (basado en status 201)
      if (!responseData.ok) {
        responseData.ok = true // Status 201 = éxito
      }

      return responseData
    } catch (error: unknown) {
      console.error("💥 [PAYMENT] Error completo:", error)

      if (error instanceof Error) {
        console.error("💥 [PAYMENT] Error message:", error.message)
        console.error("💥 [PAYMENT] Error stack:", error.stack)
      } else {
        console.error("💥 [PAYMENT] Error desconocido:", String(error))
      }

      throw error
    }
  },

  // Confirmar pago exitoso (webhook/callback)
  confirmPaymentSuccess: async (
    paymentData: PaymentSuccessRequest
  ): Promise<PaymentResponse> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl("/payments/success")
      console.log("🔗 Confirming payment success:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      console.log("📡 Payment success response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error confirming payment success:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 400) {
          throw new Error(
            errorData.message || "Datos de confirmación de pago inválidos."
          )
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment success confirmed:", result)
      return result
    } catch (error) {
      console.error("❌ Error confirming payment success:", error)
      throw error
    }
  },

  // Confirmar pago fallido (webhook/callback)
  confirmPaymentFailure: async (
    paymentData: PaymentFailureRequest
  ): Promise<PaymentResponse> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl("/payments/failure")
      console.log("🔗 Confirming payment failure:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      console.log("📡 Payment failure response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error confirming payment failure:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 400) {
          throw new Error(
            errorData.message || "Datos de confirmación de fallo inválidos."
          )
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment failure confirmed:", result)
      return result
    } catch (error) {
      console.error("❌ Error confirming payment failure:", error)
      throw error
    }
  },

  // Crear pago pendiente (el endpoint original)
  createPendingPayment: async (): Promise<{ ok: boolean; message: string }> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl("/payments/pending")
      console.log("🔗 Creating pending payment:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: "",
      })

      console.log("📡 Pending payment response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error creating pending payment:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 409) {
          throw new Error(
            errorData.message || "Ya existe un pago pendiente."
          )
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Pending payment created:", result)
      return result
    } catch (error) {
      console.error("❌ Error creating pending payment:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Verificar estado de pago
  checkPaymentStatus: async (paymentId: string): Promise<PaymentResponse> => {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/payments/status/${paymentId}`)
      console.log("🔗 Checking payment status:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Payment status response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error checking payment status:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver este pago.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment status retrieved:", result)
      return result
    } catch (error) {
      console.error("❌ Error checking payment status:", error)
      throw error
    }
  },

  // ✅ MEJORADO: Obtener historial de pagos con filtros
  getPaymentHistory: async (
    userId: string,
    options: {
      page?: number
      limit?: number
      status?: string
      dateFrom?: string
      dateTo?: string
    } = {}
  ): Promise<PaymentResponse[]> => {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = options

      // ✅ CONSTRUIR QUERY PARAMS
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (status) params.append('status', status)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(`/payments/history/${userId}?${params.toString()}`)
      console.log("🔗 Getting payment history:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Payment history response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting payment history:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver este historial.")
        }
        if (response.status === 404) {
          throw new Error("Usuario no encontrado.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment history retrieved:", result.length || 0)
      return result
    } catch (error) {
      console.error("❌ Error getting payment history:", error)
      throw error
    }
  },

  // ✅ BONUS: Cancelar pago
  cancelPayment: async (paymentId: string, reason?: string): Promise<PaymentResponse> => {
    try {
      const url = getApiUrl(`/payments/${paymentId}/cancel`)
      console.log("🔗 Canceling payment:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: reason ? JSON.stringify({ reason }) : undefined,
      })

      console.log("📡 Cancel payment response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error canceling payment:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para cancelar este pago.")
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }
        if (response.status === 409) {
          throw new Error(
            errorData.message || "No se puede cancelar un pago que ya fue procesado."
          )
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment canceled successfully:", result)
      return result
    } catch (error) {
      console.error("❌ Error canceling payment:", error)
      throw error
    }
  },

  // ✅ BONUS: Reembolsar pago
  refundPayment: async (
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResponse> => {
    try {
      const url = getApiUrl(`/payments/${paymentId}/refund`)
      console.log("🔗 Refunding payment:", url)

      const requestData: any = {}
      if (amount) requestData.amount = amount
      if (reason) requestData.reason = reason

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      console.log("📡 Refund payment response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error refunding payment:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para reembolsar pagos.")
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }
        if (response.status === 409) {
          throw new Error(
            errorData.message || "No se puede reembolsar este pago."
          )
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment refunded successfully:", result)
      return result
    } catch (error) {
      console.error("❌ Error refunding payment:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener métodos de pago disponibles
  getPaymentMethods: async (): Promise<{
    methods: Array<{
      id: string
      name: string
      type: string
      enabled: boolean
    }>
  }> => {
    try {
      const url = getApiUrl("/payments/methods")
      console.log("🔗 Getting payment methods:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Payment methods response:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting payment methods:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment methods retrieved:", result.methods?.length || 0)
      return result
    } catch (error) {
      console.error("❌ Error getting payment methods:", error)
      throw error
    }
  },
}