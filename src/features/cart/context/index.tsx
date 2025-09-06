/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/CartContext.tsx

"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react"
import { toast } from "sonner"
import { AddItemToCartRequest, Cart } from "../types/cart"
import { cartService } from "../services/services-cart"
// ✅ AGREGAR: Import del hook de auth
import useAuth from "@/features/login/hooks/useAuth" // Ajusta la ruta según tu estructura

// Tipos para el contexto
interface CartContextType {
  // Estado
  cart: Cart | null
  isLoading: boolean
  error: string | null

  // Computed values
  itemCount: number
  total: number
  isEmpty: boolean

  // Acciones
  addItem: (data: AddItemToCartRequest) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  mergeCarts: () => Promise<void>
  validateForCheckout: () => Promise<any>
  refetch: () => Promise<void>
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Props del provider
interface CartProviderProps {
  children: ReactNode
}

// Provider del carrito
export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ AGREGAR: Hook de autenticación
  const { user, loading: authLoading } = useAuth()

  // ✅ NUEVA: Función para verificar si el error es de autenticación
  const isAuthError = useCallback((error: any): boolean => {
    const message = error?.message?.toLowerCase() || ""
    const status = error?.status || error?.response?.status

    return (
      status === 401 ||
      status === 403 ||
      message.includes("forbidden") ||
      message.includes("unauthorized") ||
      message.includes("token") ||
      message.includes("authentication")
    )
  }, [])

  // ✅ MEJORADA: Función helper para manejar errores
  const handleError = useCallback(
    (error: any, defaultMessage: string, silent = false) => {
      console.error("❌ [CONTEXT] Error:", error)

      // ✅ NUEVO: Si es error de auth, limpiar carrito silenciosamente
      if (isAuthError(error)) {
        console.log(
          "🔐 Error de autenticación detectado - limpiando carrito local"
        )
        setCart(null)
        setError(null) // No mostrar error de auth al usuario
        return
      }

      // Para otros errores, mostrar normalmente
      const message = error?.message || defaultMessage
      setError(message)

      if (!silent) {
        toast.error(message)
      }
    },
    [isAuthError]
  )

  // ✅ MEJORADA: Cargar carrito inicial con verificación de auth
  const fetchCart = useCallback(async () => {
    // ✅ NUEVO: No hacer fetch si no hay usuario autenticado
    if (!user) {
      console.log("👻 No hay usuario autenticado - limpiando carrito local")
      setCart(null)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("🔄 [CONTEXT] Cargando carrito para usuario:", user.email) // Debug

      const response = await cartService.getCurrentCart()
      console.log("📦 [CONTEXT] Respuesta cruda del servicio:", response) // Debug

      let cartData: Cart | null = null

      if (response && typeof response === "object" && "data" in response) {
        cartData = response.data as Cart
      } else {
        cartData = response as Cart
      }

      console.log("📦 [CONTEXT] Carrito adaptado:", cartData) // Debug
      console.log(
        "📦 [CONTEXT] Items en carrito:",
        cartData?.items?.length || 0
      ) // Debug

      setCart(cartData)
      console.log("✅ [CONTEXT] Estado del carrito actualizado") // Debug
    } catch (error) {
      console.log("❌ [CONTEXT] Error cargando carrito:", error) // Debug
      handleError(error, "Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [user, handleError]) // ✅ AGREGAR: user como dependencia

  // ✅ MEJORADA: Agregar item al carrito con verificación de auth
  const addItem = useCallback(
    async (data: AddItemToCartRequest) => {
      // ✅ NUEVO: Verificar autenticación antes de agregar
      if (!user) {
        toast.error("Debes iniciar sesión para agregar productos al carrito")
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log("🛒 [CONTEXT] Agregando al carrito:", data) // Debug

        const addResponse = await cartService.addItem(data)
        console.log("✅ [CONTEXT] Respuesta de agregar item:", addResponse) // Debug

        // Refrescar el carrito después de agregar
        console.log("🔄 [CONTEXT] Refrescando carrito después de agregar...") // Debug
        await fetchCart()

        console.log(
          "🎯 [CONTEXT] Carrito refrescado, verificando nuevo estado..."
        ) // Debug
        toast.success("Producto agregado al carrito correctamente")
      } catch (error) {
        console.error("❌ [CONTEXT] Error agregando al carrito:", error) // Debug
        handleError(error, "Error al agregar producto al carrito")
      } finally {
        setIsLoading(false)
      }
    },
    [user, fetchCart, handleError] // ✅ AGREGAR: user como dependencia
  )

  // ✅ MEJORADA: Actualizar cantidad con verificación de auth
  // En tu contexto, reemplaza updateQuantity con esta versión:
  // Reemplaza tu función updateQuantity con esta versión corregida:

  // Función updateQuantity corregida con sincronización automática:

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!user) {
        toast.error("Debes iniciar sesión para modificar el carrito")
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Obtener el productId desde el item
        const currentCart = await cartService.getCurrentCart()
        const cartData = currentCart?.data || currentCart
        const item = cartData?.items?.find((item: any) => item.id === itemId)

        if (!item) {
          toast.error("El producto ya no está en tu carrito")
          await fetchCart()
          return
        }

        // Usar productId en lugar de itemId
        console.log(
          "🔗 Llamando endpoint con productId:",
          `/cart/items/${item.productId}`
        )
        await cartService.updateItemQuantity(item.productId, { quantity })
        await fetchCart()

        toast.success("Cantidad actualizada correctamente")
      } catch (error) {
        console.log("❌ Error en updateQuantity:", error)
        await fetchCart()
        handleError(error, "Error al actualizar la cantidad")
      } finally {
        setIsLoading(false)
      }
    },
    [user, fetchCart, handleError]
  )

  // ✅ MEJORADA: Eliminar item con verificación de auth
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!user) {
        toast.error("Debes iniciar sesión para modificar el carrito")
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        await cartService.removeItem(itemId)
        await fetchCart()

        toast.success("Producto eliminado del carrito correctamente")
      } catch (error) {
        handleError(error, "Error al eliminar el producto")
      } finally {
        setIsLoading(false)
      }
    },
    [user, fetchCart, handleError]
  )

  // ✅ MEJORADA: Vaciar carrito con verificación de auth
  const clearCart = useCallback(async () => {
    if (!user) {
      // Si no hay usuario, solo limpiar local
      setCart(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await cartService.clearCart()
      setCart(null)

      toast.success("Se eliminaron todos los productos del carrito")
    } catch (error) {
      handleError(error, "Error al vaciar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [user, handleError])

  // ✅ MEJORADA: Refrescar carrito con verificación de auth
  const refreshCart = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.refreshCart()
      setCart(response.data)

      toast.success("Los precios y stock se han actualizado")
    } catch (error) {
      handleError(error, "Error al actualizar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [user, handleError])

  // ✅ MEJORADA: Fusionar carritos con verificación de auth
  const mergeCarts = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.mergeCarts()
      setCart(response.data)

      toast.success("Los carritos se fusionaron correctamente")
    } catch (error) {
      handleError(error, "Error al fusionar los carritos")
    } finally {
      setIsLoading(false)
    }
  }, [user, handleError])

  // ✅ MEJORADA: Validar carrito con verificación de auth
  const validateForCheckout = useCallback(async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para continuar")
      return { success: false, valid: false }
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await cartService.validateCartForCheckout()

      if (!result.valid && result.errors) {
        toast.error(`Carrito no válido: ${result.errors.join(", ")}`)
      }

      return result
    } catch (error) {
      handleError(error, "Error al validar el carrito")
      return { success: false, valid: false }
    } finally {
      setIsLoading(false)
    }
  }, [user, handleError])

  // ✅ NUEVO: Effect para manejar cambios de autenticación
  // ✅ MEJORADO: Effect para manejar cambios de autenticación
  useEffect(() => {
    console.log("🔄 Auth effect - authLoading:", authLoading, "user:", !!user)

    // ✅ CAMBIO: Solo proceder cuando auth haya terminado de cargar
    if (authLoading) {
      console.log("⏳ Auth loading...")
      return
    }

    // ✅ CAMBIO: Ser explícito sobre los estados
    if (user && user.email) {
      // Verificar que realmente tengamos un usuario válido
      console.log("👤 Usuario autenticado - cargando carrito")
      fetchCart()
    } else {
      console.log("👻 Usuario no autenticado - limpiando carrito")
      setCart(null)
      setError(null)
      setIsLoading(false)
    }
  }, [user?.email, authLoading, fetchCart])

  // ✅ MEJORADO: Computed values con useMemo
  const itemCount = useMemo(() => {
    const count = cart?.items?.length || 0
    console.log(
      "🎯 [CONTEXT] Calculando itemCount:",
      count,
      "desde items:",
      cart?.items
    ) // Debug
    return count
  }, [cart?.items])

  const total = useMemo(() => {
    const totalValue = cart?.summary?.total || cart?.summary?.subtotal || 0
    console.log("🎯 [CONTEXT] Calculando total:", totalValue) // Debug
    return totalValue
  }, [cart?.summary?.total, cart?.summary?.subtotal])

  const isEmpty = useMemo(() => {
    const empty = itemCount === 0
    console.log("🎯 [CONTEXT] Calculando isEmpty:", empty) // Debug
    return empty
  }, [itemCount])

  // Debug effects
  useEffect(() => {
    console.log("🔔 [CONTEXT] itemCount cambió a:", itemCount)
  }, [itemCount])

  useEffect(() => {
    console.log("🔔 [CONTEXT] Cart cambió:", cart)
  }, [cart])

  console.log("🎯 [CONTEXT] Valores actuales:", {
    itemCount,
    total,
    isEmpty,
  }) // Debug

  // Valor del contexto
  const contextValue: CartContextType = {
    // Estado
    cart,
    isLoading,
    error,

    // Computed values
    itemCount,
    total,
    isEmpty,

    // Acciones
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    mergeCarts,
    validateForCheckout,
    refetch: fetchCart,
  }

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext)

  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }

  return context
}
