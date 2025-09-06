/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCart.ts

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { AddItemToCartRequest, Cart } from "../types/cart"
import { cartService } from "../services/services-cart"
import { Product } from "@/features/productos/types/products"

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- Errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage
    setError(message)
    toast.error(message)
  }, [])

  // ---- Cargar carrito
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.getCurrentCart()

      // Adaptar respuesta según API (puede venir en .data o plano)
      const cartData: Cart | null =
        response && typeof response === "object" && "data" in response
          ? (response.data as Cart)
          : (response as Cart)

      setCart(cartData ?? { items: [], summary: { total: 0, subtotal: 0 } } as Cart)
    } catch (err) {
      handleError(err, "Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // ---- Agregar item (request plano)
  const addItem = useCallback(
    async (data: AddItemToCartRequest) => {
      try {
        setIsLoading(true)
        setError(null)

        // Normalizar cantidad mínima
        const quantity = Math.max(1, Math.floor(Number(data.quantity ?? 1)))
        await cartService.addItem({ ...data, quantity })

        await fetchCart()
        toast.success("Producto agregado al carrito")
      } catch (err) {
        handleError(err, "Error al agregar producto al carrito")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // ---- Helper: agregar por producto
  const addProduct = useCallback(
    async (product: Product, qty: number = 1) => {
      if (!product?.id) {
        toast.error("Producto inválido")
        return
      }
      const quantity = Math.max(1, Math.floor(qty))
      await addItem({ productId: product.id, quantity })
    },
    [addItem]
  )

  // ---- Actualizar cantidad
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setIsLoading(true)
        setError(null)

        const normalized = Math.floor(Number(quantity))
        if (normalized <= 0) {
          // Si piden 0 o menos, eliminar el ítem
          await cartService.removeItem(itemId)
        } else {
          await cartService.updateItemQuantity(itemId, { quantity: normalized })
        }

        await fetchCart()
        toast.success("Cantidad actualizada")
      } catch (err) {
        handleError(err, "Error al actualizar la cantidad")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // ---- Eliminar item
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setIsLoading(true)
        setError(null)

        await cartService.removeItem(itemId)
        await fetchCart()

        toast.success("Producto eliminado del carrito")
      } catch (err) {
        handleError(err, "Error al eliminar el producto")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // ---- Vaciar carrito
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      await cartService.clearCart()
      setCart({ items: [], summary: { total: 0, subtotal: 0 } } as Cart)

      toast.success("Se vació el carrito")
    } catch (err) {
      handleError(err, "Error al vaciar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // ---- Revalidar/actualizar precios y stock
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.refreshCart()
      const cartData: Cart =
        response && typeof response === "object" && "data" in response
          ? (response.data as Cart)
          : (response as Cart)

      setCart(cartData)
      toast.success("Precios y stock actualizados")
    } catch (err) {
      handleError(err, "Error al actualizar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // ---- Fusionar carritos (guest → usuario)
  const mergeCarts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.mergeCarts()
      const cartData: Cart =
        response && typeof response === "object" && "data" in response
          ? (response.data as Cart)
          : (response as Cart)

      setCart(cartData)
      toast.success("Carritos fusionados")
    } catch (err) {
      handleError(err, "Error al fusionar carritos")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // ---- Validar carrito antes de checkout
  const validateForCheckout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await cartService.validateCartForCheckout()

      if (!result?.valid && result?.errors?.length) {
        toast.error(`Carrito no válido: ${result.errors.join(", ")}`)
      }
      return result
    } catch (err) {
      handleError(err, "Error al validar el carrito")
      return { success: false, valid: false }
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // ---- Cargar al montar
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ---- Derivados
  const itemCount = useMemo(() => {
    // suma de cantidades (no cantidad de líneas)
    const qty =
      cart?.items?.reduce((acc, it: any) => acc + Number(it?.quantity || 0), 0) || 0
    return qty
  }, [cart?.items])

  const total = useMemo(() => {
    // prioriza total, si no, usa subtotal
    return Number(cart?.summary?.total ?? cart?.summary?.subtotal ?? 0)
  }, [cart?.summary?.total, cart?.summary?.subtotal])

  const isEmpty = useMemo(() => itemCount === 0, [itemCount])

  return {
    // Estado
    cart,
    isLoading,
    error,

    // Computados
    itemCount, // suma de cantidades
    total,
    isEmpty,

    // Acciones
    addItem,            // recibe { productId, quantity, ... }
    addProduct,         // recibe (product, qty)
    updateQuantity,     // cambia cantidad / elimina si qty<=0
    removeItem,
    clearCart,
    refreshCart,
    mergeCarts,
    validateForCheckout,
    refetch: fetchCart,
  }
}
