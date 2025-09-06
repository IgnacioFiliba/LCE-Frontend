/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useFavorites.ts

import { authService } from "@/features/login/services/login-service"
import { useState, useEffect, useCallback } from "react"

import { toast } from "sonner" // o el sistema de toast que uses
import { favoritesService } from "../services/favorite-service"
import { FavoriteItem, FavoriteProductSimple } from "../types/favorite"

interface UseFavoritesReturn {
  // Estados
  favorites: FavoriteItem[]
  favoriteProducts: FavoriteProductSimple[]
  favoriteIds: string[]
  isLoading: boolean
  error: string | null

  // Métodos
  fetchFavorites: () => Promise<void>
  addToFavorites: (productId: string) => Promise<boolean>
  removeFromFavorites: (productId: string) => Promise<boolean>
  toggleFavorite: (productId: string) => Promise<boolean>
  isFavorite: (productId: string) => boolean
  clearAllFavorites: () => Promise<boolean>
  refreshFavorites: () => Promise<void>
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Estado derivado con validación defensiva
  const favoriteProducts: FavoriteProductSimple[] = (favorites || []).map(
    (fav) => ({
      id: fav.product?.id || "",
      name: fav.product?.name || "",
      price: fav.product?.price || 0,
      imgUrl: fav.product?.imgUrl || "",
      brand: fav.product?.brand || "",
      model: fav.product?.model || "",
      year: fav.product?.year || "",
      stock: fav.product?.stock || 0,
    })
  )

  const favoriteIds: string[] = (favorites || [])
    .map((fav) => fav.productId)
    .filter(Boolean)

  // Función para obtener favoritos
  const fetchFavorites = useCallback(async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      setFavorites([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔄 Obteniendo favoritos...")
      const favoritesData = await favoritesService.getFavorites()

      // Validación defensiva: asegurar que es un array
      const validFavorites = Array.isArray(favoritesData) ? favoritesData : []

      // Filtrar items que podrían estar mal formados
      const cleanFavorites = validFavorites.filter(
        (fav) => fav && fav.productId && fav.product && fav.product.id
      )

      setFavorites(cleanFavorites)
      console.log("✅ Favoritos obtenidos:", cleanFavorites.length)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error obteniendo favoritos"
      console.error("❌ Error obteniendo favoritos:", err)
      setError(errorMessage)
      setFavorites([]) // Asegurar que favorites nunca sea undefined

      // Solo mostrar toast si no es un error de autenticación
      if (
        !errorMessage.includes("sesión") &&
        !errorMessage.includes("iniciar sesión")
      ) {
        toast.error("Error al cargar favoritos")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para agregar a favoritos
  const addToFavorites = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!authService.isAuthenticated()) {
        toast.error("Debes iniciar sesión para agregar favoritos")
        return false
      }

      setError(null)

      try {
        console.log("❤️ Agregando a favoritos:", productId)
        const newFavorite = await favoritesService.addToFavorites(productId)

        // Agregar al estado local inmediatamente
        setFavorites((prev) => [...prev, newFavorite])

        toast.success("Producto agregado a favoritos")
        console.log("✅ Producto agregado a favoritos")
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error agregando a favoritos"
        console.error("❌ Error agregando a favoritos:", err)
        setError(errorMessage)

        if (errorMessage.includes("ya está en tus favoritos")) {
          toast.info("Este producto ya está en tus favoritos")
        } else if (!errorMessage.includes("sesión")) {
          toast.error("Error al agregar a favoritos")
        }

        return false
      }
    },
    []
  )

  // Función para eliminar de favoritos
  const removeFromFavorites = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!authService.isAuthenticated()) {
        toast.error("Debes iniciar sesión para gestionar favoritos")
        return false
      }

      setError(null)

      try {
        console.log("💔 Eliminando de favoritos:", productId)
        await favoritesService.removeFromFavorites(productId)

        // Eliminar del estado local inmediatamente
        setFavorites((prev) =>
          prev.filter((fav) => fav.productId !== productId)
        )

        toast.success("Producto eliminado de favoritos")
        console.log("✅ Producto eliminado de favoritos")
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error eliminando de favoritos"
        console.error("❌ Error eliminando de favoritos:", err)
        setError(errorMessage)

        if (!errorMessage.includes("sesión")) {
          toast.error("Error al eliminar de favoritos")
        }

        return false
      }
    },
    []
  )

  // Función para toggle favorito
  const toggleFavorite = useCallback(
    async (productId: string): Promise<boolean> => {
      const isCurrentlyFavorite = favoriteIds.includes(productId)

      if (isCurrentlyFavorite) {
        return await removeFromFavorites(productId)
      } else {
        return await addToFavorites(productId)
      }
    },
    [favoriteIds, addToFavorites, removeFromFavorites]
  )

  // Función para verificar si es favorito (síncrona, usa estado local)
  const isFavorite = useCallback(
    (productId: string): boolean => {
      if (!productId || favoriteIds.length === 0) return false
      return favoriteIds.includes(productId)
    },
    [favoriteIds]
  )

  // Función para limpiar todos los favoritos
  const clearAllFavorites = useCallback(async (): Promise<boolean> => {
    if (!authService.isAuthenticated()) {
      toast.error("Debes iniciar sesión para limpiar favoritos")
      return false
    }

    setError(null)

    try {
      console.log("🧹 Limpiando todos los favoritos...")
      await favoritesService.clearAllFavorites()

      // Limpiar estado local
      setFavorites([])

      toast.success("Todos los favoritos han sido eliminados")
      console.log("✅ Todos los favoritos eliminados")
      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error limpiando favoritos"
      console.error("❌ Error limpiando favoritos:", err)
      setError(errorMessage)

      if (!errorMessage.includes("sesión")) {
        toast.error("Error al limpiar favoritos")
      }

      return false
    }
  }, [])

  // Alias para refrescar
  const refreshFavorites = fetchFavorites

  // Efecto para cargar favoritos al montar o cambiar autenticación
  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated()

    if (isAuthenticated) {
      fetchFavorites()
    } else {
      // Si no está autenticado, limpiar favoritos
      setFavorites([])
      setError(null)
    }
  }, [fetchFavorites])

  // Efecto para escuchar cambios de autenticación
  useEffect(() => {
    const checkAuthAndRefresh = () => {
      if (authService.isAuthenticated()) {
        fetchFavorites()
      } else {
        setFavorites([])
        setError(null)
      }
    }

    // Verificar cada 30 segundos si sigue autenticado
    const interval = setInterval(checkAuthAndRefresh, 30000)

    return () => clearInterval(interval)
  }, [fetchFavorites])

  return {
    // Estados
    favorites,
    favoriteProducts,
    favoriteIds,
    isLoading,
    error,

    // Métodos
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    refreshFavorites,
  }
}
