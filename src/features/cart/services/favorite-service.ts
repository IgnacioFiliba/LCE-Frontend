/* eslint-disable @typescript-eslint/no-explicit-any */
// services/favoritesService.ts

import { getApiUrl } from "@/config/urls"
import { authService } from "@/features/login/services/login-service"
import { FavoriteItem, FavoriteProductSimple } from "../types/favorite"

class FavoritesService {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()

    if (typeof window !== "undefined") {
      console.log("❤️ FavoritesService initialized with baseURL:", this.baseURL)
    }
  }

  // Método helper para hacer requests con autorización
  private async makeAuthorizedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const fullUrl = getApiUrl(endpoint)
    const token = authService.getToken()

    if (!token) {
      throw new Error("No hay token de autenticación. Debes iniciar sesión.")
    }

    if (typeof window !== "undefined") {
      console.log("📤 Making authorized request to:", fullUrl)
      console.log("📤 Request options:", options)
    }

    try {
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
          // Token expirado o inválido
          authService.removeToken()
          authService.removeUser()
          throw new Error(
            "Sesión expirada. Por favor, inicia sesión nuevamente."
          )
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción")
        }
        if (response.status === 404) {
          throw new Error("Producto no encontrado")
        }
        if (response.status === 409) {
          throw new Error("El producto ya está en tus favoritos")
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

  // Obtener todos los favoritos del usuario
  async getFavorites(): Promise<FavoriteItem[]> {
    console.log("📤 OBTENIENDO FAVORITOS DEL USUARIO")

    if (!authService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión para ver tus favoritos")
    }

    const data = await this.makeAuthorizedRequest("/favorites", {
      method: "GET",
    })

    console.log("✅ FAVORITOS OBTENIDOS:", data)

    // Validación defensiva: asegurar que siempre devolvemos un array
    let favoritesList: FavoriteItem[] = []

    if (Array.isArray(data)) {
      favoritesList = data
    } else if (data && Array.isArray(data.data)) {
      favoritesList = data.data
    } else if (data && Array.isArray(data.favorites)) {
      favoritesList = data.favorites
    } else {
      console.warn("⚠️ Estructura de respuesta inesperada:", data)
      favoritesList = []
    }

    return favoritesList
  }

  // Agregar producto a favoritos
  async addToFavorites(productId: string): Promise<FavoriteItem> {
    console.log("📤 AGREGANDO A FAVORITOS - Product ID:", productId)

    if (!authService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión para agregar favoritos")
    }

    if (!productId || productId.trim() === "") {
      throw new Error("ID de producto no válido")
    }

    const data = await this.makeAuthorizedRequest(`/favorites/${productId}`, {
      method: "POST",
    })

    console.log("✅ PRODUCTO AGREGADO A FAVORITOS:", data)
    return data
  }

  // Eliminar producto de favoritos
  async removeFromFavorites(productId: string): Promise<boolean> {
    console.log("📤 ELIMINANDO DE FAVORITOS - Product ID:", productId)

    if (!authService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión para eliminar favoritos")
    }

    if (!productId || productId.trim() === "") {
      throw new Error("ID de producto no válido")
    }

    await this.makeAuthorizedRequest(`/favorites/${productId}`, {
      method: "DELETE",
    })

    console.log("✅ PRODUCTO ELIMINADO DE FAVORITOS")
    return true
  }

  // Verificar si un producto está en favoritos
  async isFavorite(productId: string): Promise<boolean> {
    if (!authService.isAuthenticated()) {
      return false
    }

    try {
      const favorites = await this.getFavorites()
      return favorites.some((favorite) => favorite.productId === productId)
    } catch (error) {
      console.error("Error checking if product is favorite:", error)
      return false
    }
  }

  // Toggle favorito (agregar si no está, eliminar si está)
  async toggleFavorite(
    productId: string
  ): Promise<{ isFavorite: boolean; item?: FavoriteItem }> {
    console.log("📤 TOGGLE FAVORITO - Product ID:", productId)

    if (!authService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión para gestionar favoritos")
    }

    const isCurrentlyFavorite = await this.isFavorite(productId)

    if (isCurrentlyFavorite) {
      await this.removeFromFavorites(productId)
      return { isFavorite: false }
    } else {
      const item = await this.addToFavorites(productId)
      return { isFavorite: true, item }
    }
  }

  // Obtener solo los productos favoritos (versión simplificada)
  async getFavoriteProducts(): Promise<FavoriteProductSimple[]> {
    try {
      const favorites = await this.getFavorites()

      return favorites.map((favorite) => ({
        id: favorite.product.id,
        name: favorite.product.name,
        price: favorite.product.price,
        imgUrl: favorite.product.imgUrl,
        brand: favorite.product.brand,
        model: favorite.product.model,
        year: favorite.product.year,
        stock: favorite.product.stock,
      }))
    } catch (error) {
      console.error("Error obteniendo productos favoritos:", error)
      return []
    }
  }

  // Obtener IDs de productos favoritos (útil para checks rápidos)
  async getFavoriteProductIds(): Promise<string[]> {
    try {
      const favorites = await this.getFavorites()
      return favorites.map((favorite) => favorite.productId)
    } catch (error) {
      console.error("Error obteniendo IDs de favoritos:", error)
      return []
    }
  }

  // Limpiar todos los favoritos
  async clearAllFavorites(): Promise<boolean> {
    console.log("📤 LIMPIANDO TODOS LOS FAVORITOS")

    if (!authService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión para limpiar favoritos")
    }

    try {
      const favorites = await this.getFavorites()

      // Eliminar cada favorito individualmente
      const deletePromises = favorites.map((favorite) =>
        this.removeFromFavorites(favorite.productId)
      )

      await Promise.all(deletePromises)

      console.log("✅ TODOS LOS FAVORITOS ELIMINADOS")
      return true
    } catch (error) {
      console.error("❌ Error limpiando favoritos:", error)
      throw error
    }
  }
}

export const favoritesService = new FavoritesService()
