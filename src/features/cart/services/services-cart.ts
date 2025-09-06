/* eslint-disable @typescript-eslint/no-explicit-any */
// services/cartService.ts

import {
  CartResponse,
  AddItemToCartRequest,
  CartItemResponse,
  UpdateItemQuantityRequest,
  MergeCartRequest,
} from "../types/cart"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class CartService {
  // ✅ MÉTODO MEJORADO PARA FETCH CON NEXT.JS
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // ✅ PROTEGER LOCALSTORAGE PARA NEXT.JS
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("authToken")
        : null

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    // ✅ USAR URLs DINÁMICAS
    const fullUrl = getApiUrl(endpoint)

    // ✅ SOLO LOGS EN CLIENTE
    if (typeof window !== "undefined") {
      console.log("🔗 Calling API:", fullUrl)
      console.log("🔗 Using API Base:", getApiUrl())
      console.log("🔑 Using token:", !!token)
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: "include", // Para cookies si las usas
      })

      if (typeof window !== "undefined") {
        console.log("📡 Response status:", response.status)
        console.log("📡 Response ok:", response.ok)
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Error de conexión",
        }))

        if (typeof window !== "undefined") {
          console.error("❌ API Error:", error)
        }

        // ✅ MEJORADO: Manejo específico de errores
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para acceder al carrito.")
        }
        if (response.status === 404) {
          throw new Error("Carrito o item no encontrado.")
        }
        if (response.status === 409) {
          throw new Error(
            "Conflicto en el carrito. Algunos productos no están disponibles."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(error.message || "Error en la petición")
      }

      // ✅ MANEJAR RESPUESTAS DELETE CORRECTAMENTE
      if (options.method === "DELETE" && response.ok) {
        if (typeof window !== "undefined") {
          console.log("✅ DELETE exitoso - respuesta vacía esperada")
        }
        return { success: true, message: "Deleted successfully" }
      }

      // ✅ VERIFICAR SI HAY CONTENIDO ANTES DE PARSEAR JSON
      const contentLength = response.headers.get("content-length")
      const contentType = response.headers.get("content-type")

      // Si no hay contenido o no es JSON, no parsear
      if (contentLength === "0" || !contentType?.includes("application/json")) {
        if (typeof window !== "undefined") {
          console.log("✅ Respuesta sin contenido JSON")
        }
        return response.ok ? { success: true } : null
      }

      // ✅ VERIFICAR QUE HAY TEXTO ANTES DE PARSEAR
      const text = await response.text()

      if (typeof window !== "undefined") {
        console.log("📋 Response text:", `"${text}"`)
      }

      if (!text || text.trim().length === 0) {
        if (typeof window !== "undefined") {
          console.log("✅ Respuesta vacía pero exitosa")
        }
        return response.ok ? { success: true } : null
      }

      // Solo parsear si hay contenido real
      const data = JSON.parse(text)

      if (typeof window !== "undefined") {
        console.log("📦 API Response data:", data)
      }

      return data
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ Fetch error:", error)
      }
      throw error
    }
  }

  // GET /cart - Obtener carrito vigente
  async getCurrentCart(): Promise<CartResponse> {
    const response = await this.fetchWithAuth("/cart")

    if (typeof window !== "undefined") {
      console.log("🛒 Respuesta del carrito:", response)
    }

    return response
  }

  // GET /cart - Obtener carrito (alias)
  async getCart(): Promise<CartResponse> {
    return this.fetchWithAuth("/cart")
  }

  // POST /cart/items - Agregar item al carrito
  async addItem(data: AddItemToCartRequest): Promise<CartItemResponse> {
    if (typeof window !== "undefined") {
      console.log("➕ Agregando item:", data)
    }

    const response = await this.fetchWithAuth("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (typeof window !== "undefined") {
      console.log("✅ Respuesta agregar item:", response)
    }

    return response
  }

  // PATCH /cart/items/{itemId} - Actualizar cantidad
  async updateItemQuantity(
    itemId: string,
    data: UpdateItemQuantityRequest
  ): Promise<CartItemResponse> {
    if (typeof window !== "undefined") {
      console.log("🔄 Actualizando cantidad:", { itemId, data })
    }

    return this.fetchWithAuth(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // DELETE /cart/items/{itemId} - Eliminar item
  async removeItem(itemId: string): Promise<{ success: boolean }> {
    if (typeof window !== "undefined") {
      console.log("🗑️ Eliminando item:", itemId)
    }

    const response = await this.fetchWithAuth(`/cart/items/${itemId}`, {
      method: "DELETE",
    })

    if (typeof window !== "undefined") {
      console.log("✅ Item eliminado:", response)
    }

    return response
  }

  // DELETE /cart - Vaciar carrito
  async clearCart(): Promise<{ success: boolean }> {
    if (typeof window !== "undefined") {
      console.log("🧹 Vaciando carrito...")
    }

    const response = await this.fetchWithAuth("/cart", {
      method: "DELETE",
    })

    if (typeof window !== "undefined") {
      console.log("✅ Carrito vaciado:", response)
    }

    return response
  }

  // POST /cart - Clear carrito (invitado)
  async clearGuestCart(): Promise<{ success: boolean }> {
    return this.fetchWithAuth("/cart", {
      method: "POST",
    })
  }

  // POST /cart/refresh - Revalidar carrito
  async refreshCart(): Promise<CartResponse> {
    if (typeof window !== "undefined") {
      console.log("🔄 Refrescando carrito...")
    }

    const response = await this.fetchWithAuth("/cart/refresh", {
      method: "POST",
    })

    if (typeof window !== "undefined") {
      console.log("✅ Carrito refrescado:", response)
    }

    return response
  }

  // POST /cart/merge - Fusionar carritos
  async mergeCarts(data: MergeCartRequest = {}): Promise<CartResponse> {
    if (typeof window !== "undefined") {
      console.log("🔀 Fusionando carritos:", data)
    }

    const response = await this.fetchWithAuth("/cart/merge", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (typeof window !== "undefined") {
      console.log("✅ Carritos fusionados:", response)
    }

    return response
  }

  // POST /cart/checkout - Validar y preparar payload para checkout
  async validateCartForCheckout(): Promise<{
    success: boolean
    valid: boolean
    errors?: string[]
    items?: any[]
    status?: string
    summary?: any
  }> {
    if (typeof window !== "undefined") {
      console.log("🔍 Validando carrito para checkout...")
    }

    const response = await this.fetchWithAuth("/cart/checkout", {
      method: "POST",
    })

    if (typeof window !== "undefined") {
      console.log("✅ Respuesta validación checkout:", response)
    }

    return response
  }

  // ✅ MEJORADO: Obtener resumen del carrito
  async getCartSummary(): Promise<{
    totalItems: number
    totalAmount: number
    currency: string
    hasItems: boolean
  }> {
    if (typeof window !== "undefined") {
      console.log("📊 Obteniendo resumen del carrito...")
    }

    const response = await this.fetchWithAuth("/cart/summary")

    if (typeof window !== "undefined") {
      console.log("✅ Resumen del carrito:", response)
    }

    return response
  }

  // ✅ MEJORADO: Aplicar cupón de descuento
  async applyCoupon(couponCode: string): Promise<CartResponse> {
    if (typeof window !== "undefined") {
      console.log("🎫 Aplicando cupón:", couponCode)
    }

    const response = await this.fetchWithAuth("/cart/coupon", {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    })

    if (typeof window !== "undefined") {
      console.log("✅ Cupón aplicado:", response)
    }

    return response
  }

  // ✅ MEJORADO: Remover cupón
  async removeCoupon(): Promise<CartResponse> {
    if (typeof window !== "undefined") {
      console.log("🗑️ Removiendo cupón...")
    }

    const response = await this.fetchWithAuth("/cart/coupon", {
      method: "DELETE",
    })

    if (typeof window !== "undefined") {
      console.log("✅ Cupón removido:", response)
    }

    return response
  }

  // ✅ MEJORADO: Verificar disponibilidad de stock
  async checkStockAvailability(): Promise<{
    available: boolean
    unavailableItems: Array<{
      itemId: string
      productId: string
      requestedQuantity: number
      availableStock: number
    }>
  }> {
    if (typeof window !== "undefined") {
      console.log("📦 Verificando disponibilidad de stock...")
    }

    const response = await this.fetchWithAuth("/cart/stock-check")

    if (typeof window !== "undefined") {
      console.log("✅ Verificación de stock:", response)
    }

    return response
  }

  // ✅ BONUS: Obtener información detallada del carrito
  async getCartDetails(): Promise<{
    cart: CartResponse
    shipping: {
      available: boolean
      cost: number
      estimatedDays: number
    }
    taxes: {
      rate: number
      amount: number
    }
    totals: {
      subtotal: number
      shipping: number
      taxes: number
      total: number
    }
  }> {
    if (typeof window !== "undefined") {
      console.log("📋 Obteniendo detalles completos del carrito...")
    }

    const response = await this.fetchWithAuth("/cart/details")

    if (typeof window !== "undefined") {
      console.log("✅ Detalles del carrito:", response)
    }

    return response
  }

  // ✅ BONUS: Guardar carrito para más tarde
  async saveForLater(itemId: string): Promise<{ success: boolean }> {
    if (typeof window !== "undefined") {
      console.log("💾 Guardando item para más tarde:", itemId)
    }

    const response = await this.fetchWithAuth(
      `/cart/items/${itemId}/save-later`,
      {
        method: "PATCH",
      }
    )

    if (typeof window !== "undefined") {
      console.log("✅ Item guardado para más tarde:", response)
    }

    return response
  }

  // ✅ BONUS: Mover item guardado al carrito
  async moveToCart(itemId: string): Promise<CartItemResponse> {
    if (typeof window !== "undefined") {
      console.log("🔄 Moviendo item al carrito:", itemId)
    }

    const response = await this.fetchWithAuth(
      `/cart/items/${itemId}/move-to-cart`,
      {
        method: "PATCH",
      }
    )

    if (typeof window !== "undefined") {
      console.log("✅ Item movido al carrito:", response)
    }

    return response
  }

  // ✅ BONUS: Obtener items guardados para más tarde
  async getSavedItems(): Promise<{
    items: Array<{
      itemId: string
      productId: string
      name: string
      price: number
      image: string
      savedAt: string
    }>
  }> {
    if (typeof window !== "undefined") {
      console.log("💾 Obteniendo items guardados...")
    }

    const response = await this.fetchWithAuth("/cart/saved-items")

    if (typeof window !== "undefined") {
      console.log("✅ Items guardados:", response.items?.length || 0)
    }

    return response
  }

  // ✅ BONUS: Calcular envío
  async calculateShipping(address: {
    country: string
    state: string
    city: string
    zipCode: string
  }): Promise<{
    options: Array<{
      id: string
      name: string
      cost: number
      estimatedDays: number
      description: string
    }>
  }> {
    if (typeof window !== "undefined") {
      console.log("📦 Calculando opciones de envío:", address)
    }

    const response = await this.fetchWithAuth("/cart/shipping-options", {
      method: "POST",
      body: JSON.stringify(address),
    })

    if (typeof window !== "undefined") {
      console.log("✅ Opciones de envío:", response.options?.length || 0)
    }

    return response
  }

  // ✅ BONUS: Aplicar código promocional
  async applyPromoCode(promoCode: string): Promise<{
    success: boolean
    discount: {
      type: "percentage" | "fixed"
      value: number
      description: string
    }
    newTotal: number
  }> {
    if (typeof window !== "undefined") {
      console.log("🎯 Aplicando código promocional:", promoCode)
    }

    const response = await this.fetchWithAuth("/cart/promo-code", {
      method: "POST",
      body: JSON.stringify({ promoCode }),
    })

    if (typeof window !== "undefined") {
      console.log("✅ Código promocional aplicado:", response)
    }

    return response
  }
}

export const cartService = new CartService()
