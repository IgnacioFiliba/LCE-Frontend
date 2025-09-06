/* eslint-disable @typescript-eslint/no-explicit-any */
// services/productService.ts - ESPECIALIZADO EN DETALLES DE PRODUCTO

import { ProductDetailResponse } from "../types/detail"
import { getApiUrl } from "@/config/urls"

class ProductService {
  constructor() {
    if (typeof window !== "undefined") {
      console.log("🌐 ProductService (Detail) initialized with baseURL:", getApiUrl())
    }
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" }

    if (includeAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken")
      if (token) headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  // 🔧 Normaliza comments para que el front siempre reciba el mismo shape
  private normalizeDetail(data: any): ProductDetailResponse & {
    comments?: Array<{
      id: string
      userId?: string
      userName?: string
      userImg?: string
      rating?: number
      comment?: string
      createdAt?: string
    }>
  } {
    const rawComments = Array.isArray(data?.comments) ? data.comments : []

    const comments = rawComments.map((c: any) => ({
      id: c?.id ?? String(Math.random()),
      userId: c?.userId ?? c?.user?.id ?? undefined,
      userName: c?.userName ?? c?.user?.name ?? "Usuario",
      userImg: c?.user?.imgUrl ?? c?.userImg ?? c?.avatar ?? null,
      rating: Number(c?.rating ?? c?.stars ?? 0),
      comment: c?.comment ?? c?.content ?? "",
      createdAt: (c?.createdAt ?? c?.created_at ?? new Date().toISOString()) as string,
    }))

    // Si el back no trae average/total, los derivamos de comments
    const totalReviews = typeof data?.totalReviews === "number" ? data.totalReviews : comments.length
    const averageRating =
      typeof data?.averageRating === "number"
        ? data.averageRating
        : totalReviews > 0
        ? Math.round(
            (comments.reduce((acc: number, x: any) => acc + Number(x?.rating || 0), 0) /
              totalReviews) * 10
          ) / 10
        : 0

    return {
      ...data,
      comments,
      totalReviews,
      averageRating,
    }
  }

  // ✅ Detalle de producto (incluye comments si el back los envía)
  async getProductDetail(id: string): Promise<ProductDetailResponse & { comments?: any[] }> {
    const url = getApiUrl(`/products/${id}`)
    console.log("🔗 Obteniendo detalle del producto:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      console.log("📡 Product detail response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en getProductDetail:", response.status, errorData)

        if (response.status === 404) throw new Error("Producto no encontrado.")
        if (response.status === 403) throw new Error("Este producto no está disponible.")
        if (response.status >= 500) throw new Error("Error del servidor. Intenta de nuevo más tarde.")

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const raw = await response.json()
      const data = this.normalizeDetail(raw)
      console.log("✅ Detalle del producto obtenido:", data.id || data.name, "| comments:", data.comments?.length || 0)
      return data
    } catch (error) {
      console.error("❌ Get product detail error:", error)
      throw error
    }
  }

  async getCategories() {
    const url = getApiUrl("/categories")
    console.log("🔗 Obteniendo categorías:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      console.log("📡 Categories response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en getCategories:", response.status, errorData)

        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Categorías obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Get categories error:", error)
      throw error
    }
  }

  async createProduct(productData: any) {
    const url = getApiUrl("/products")
    console.log("🔗 Creando producto:", url, productData)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(true),
        credentials: "include",
        body: JSON.stringify(productData),
      })

      console.log("📡 Create product response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en createProduct:", response.status, errorData)

        if (response.status === 401) throw new Error("No estás autenticado. Por favor inicia sesión.")
        if (response.status === 403) throw new Error("No tienes permisos para crear productos.")
        if (response.status === 400) {
          throw new Error(
            Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message || "Datos de producto inválidos."
          )
        }
        if (response.status === 409) throw new Error("Ya existe un producto con este nombre o código.")
        if (response.status >= 500) throw new Error("Error del servidor. Intenta de nuevo más tarde.")

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Producto creado:", data.id || data.name)
      return data
    } catch (error) {
      console.error("❌ Create product error:", error)
      throw error
    }
  }

  async updateProduct(id: string, productData: any) {
    const url = getApiUrl(`/products/${id}`)
    console.log("🔗 Actualizando producto:", url, productData)

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getHeaders(true),
        credentials: "include",
        body: JSON.stringify(productData),
      })

      console.log("📡 Update product response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en updateProduct:", response.status, errorData)

        if (response.status === 401) throw new Error("No estás autenticado. Por favor inicia sesión.")
        if (response.status === 403) throw new Error("No tienes permisos para actualizar productos.")
        if (response.status === 404) throw new Error("Producto no encontrado.")
        if (response.status === 400) {
          throw new Error(
            Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message || "Datos de actualización inválidos."
          )
        }
        if (response.status === 409) throw new Error("Conflicto: Ya existe un producto con estos datos.")

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Producto actualizado:", data.id || data.name)
      return data
    } catch (error) {
      console.error("❌ Update product error:", error)
      throw error
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductDetailResponse[]> {
    const url = getApiUrl(`/products/${productId}/related?limit=${limit}`)
    console.log("🔗 Obteniendo productos relacionados:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        console.log("⚠️ No se pudieron obtener productos relacionados")
        return []
      }

      const data = await response.json()
      console.log("✅ Productos relacionados obtenidos:", data.length || 0)
      return Array.isArray(data) ? data : data.products || []
    } catch (error) {
      console.error("❌ Get related products error:", error)
      return []
    }
  }

  // 🛈 Este endpoint sigue siendo útil si tenés paginación de reseñas aparte.
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: Array<{
      id: string
      userId: string
      userName: string
      rating: number
      comment: string
      createdAt: string
    }>
    totalCount: number
    averageRating: number
  }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const url = getApiUrl(`/products/${productId}/reviews?${params.toString()}`)
    console.log("🔗 Obteniendo reseñas del producto:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        console.log("⚠️ No se pudieron obtener reseñas")
        return { reviews: [], totalCount: 0, averageRating: 0 }
      }

      const data = await response.json()
      console.log("✅ Reseñas obtenidas:", data.reviews?.length || 0)
      return data
    } catch (error) {
      console.error("❌ Get product reviews error:", error)
      return { reviews: [], totalCount: 0, averageRating: 0 }
    }
  }

  async checkProductStock(productId: string): Promise<{
    available: boolean
    stock: number
    reservedStock: number
    availableStock: number
  }> {
    const url = getApiUrl(`/products/${productId}/stock`)
    console.log("🔗 Verificando stock del producto:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        console.log("⚠️ No se pudo verificar el stock")
        return { available: false, stock: 0, reservedStock: 0, availableStock: 0 }
      }

      const data = await response.json()
      console.log("✅ Stock verificado:", data)
      return data
    } catch (error) {
      console.error("❌ Check stock error:", error)
      return { available: false, stock: 0, reservedStock: 0, availableStock: 0 }
    }
  }

  async getProductVariants(productId: string): Promise<
    Array<{ id: string; name: string; value: string; price?: number; stock?: number; available: boolean }>
  > {
    const url = getApiUrl(`/products/${productId}/variants`)
    console.log("🔗 Obteniendo variantes del producto:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        console.log("⚠️ No se pudieron obtener variantes")
        return []
      }

      const data = await response.json()
      console.log("✅ Variantes obtenidas:", data.length || 0)
      return Array.isArray(data) ? data : data.variants || []
    } catch (error) {
      console.error("❌ Get variants error:", error)
      return []
    }
  }

  async toggleProductFavorite(productId: string): Promise<{ isFavorite: boolean }> {
    const url = getApiUrl(`/products/${productId}/favorite`)
    console.log("🔗 Cambiando estado de favorito:", url)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(true),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error cambiando favorito:", response.status, errorData)
        if (response.status === 401) throw new Error("Debes iniciar sesión para marcar favoritos.")
        throw new Error("Error al marcar como favorito.")
      }

      const data = await response.json()
      console.log("✅ Estado de favorito cambiado:", data.isFavorite)
      return data
    } catch (error) {
      console.error("❌ Toggle favorite error:", error)
      throw error
    }
  }

  async getSimilarProducts(productId: string, limit: number = 6): Promise<ProductDetailResponse[]> {
    const url = getApiUrl(`/products/${productId}/similar?limit=${limit}`)
    console.log("🔗 Obteniendo productos similares:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        console.log("⚠️ No se pudieron obtener productos similares")
        return []
      }

      const data = await response.json()
      console.log("✅ Productos similares obtenidos:", data.length || 0)
      return Array.isArray(data) ? data : data.products || []
    } catch (error) {
      console.error("❌ Get similar products error:", error)
      return []
    }
  }
}

export const productService = new ProductService()
