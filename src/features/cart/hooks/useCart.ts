/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCart.ts

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { AddItemToCartRequest, Cart, CartSummary } from "../types/cart"
import { cartService } from "../services/services-cart"
import { Product } from "@/features/productos/types/products"

// ✅ Defaults completos según tu CartSummary
const DEFAULT_SUMMARY: CartSummary = {
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
  currency: "ARS",
  invalidItemsCount: 0,
  subTotal: 0,     // backend duplica con casing distinto
  grandTotal: 0,   // backend duplica total
}

// ✅ Normaliza cualquier objeto "parecido" a CartSummary
function normalizeSummary(input: any): CartSummary {
  const subTotalRaw = Number(
    input?.subTotal ?? input?.subtotal ?? DEFAULT_SUMMARY.subTotal
  )

  const discount = Number(input?.discount ?? DEFAULT_SUMMARY.discount)
  const tax = Number(input?.tax ?? DEFAULT_SUMMARY.tax)

  // total: preferimos total → grandTotal → subtotal - discount + tax
  const totalRaw = Number(
    input?.total ??
      input?.grandTotal ??
      (Number.isFinite(subTotalRaw) ? subTotalRaw - discount + tax : DEFAULT_SUMMARY.total)
  )

  const currency = String(input?.currency ?? DEFAULT_SUMMARY.currency)
  const invalidItemsCount = Number(
    input?.invalidItemsCount ?? DEFAULT_SUMMARY.invalidItemsCount
  )

  const subtotal = Number(
    input?.subtotal ?? input?.subTotal ?? DEFAULT_SUMMARY.subtotal
  )
  const grandTotal = Number(
    input?.grandTotal ?? input?.total ?? DEFAULT_SUMMARY.grandTotal
  )

  return {
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    discount: Number.isFinite(discount) ? discount : 0,
    tax: Number.isFinite(tax) ? tax : 0,
    total: Number.isFinite(totalRaw) ? totalRaw : 0,
    currency,
    invalidItemsCount: Number.isFinite(invalidItemsCount) ? invalidItemsCount : 0,
    subTotal: Number.isFinite(subTotalRaw) ? subTotalRaw : 0,
    grandTotal: Number.isFinite(grandTotal) ? grandTotal : 0,
  }
}

// ✅ Fallback Cart que cumple el tipo
const EMPTY_CART: Cart = {
  id: "temp",
  userId: "anonymous",
  items: [],
  summary: { ...DEFAULT_SUMMARY },
}

function normalizeCart(data: any): Cart {
  if (!data || typeof data !== "object") return EMPTY_CART

  const items = Array.isArray(data.items) ? data.items : []

  const summary: CartSummary = normalizeSummary(data.summary ?? {})

  return {
    ...data,
    id: data.id ?? "temp",
    userId: data.userId ?? "anonymous",
    items,
    summary,
  } as Cart
}

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
      const raw =
        response && typeof response === "object" && "data" in response
          ? (response as any).data
          : response

      setCart(raw ? normalizeCart(raw) : EMPTY_CART)
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
      setCart(EMPTY_CART)

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
      const raw =
        response && typeof response === "object" && "data" in response
          ? (response as any).data
          : response

      setCart(normalizeCart(raw))
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
      const raw =
        response && typeof response === "object" && "data" in response
          ? (response as any).data
          : response

      setCart(normalizeCart(raw))
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
    return cart?.items?.reduce((acc: number, it: any) => acc + Number(it?.quantity || 0), 0) || 0
  }, [cart?.items])

  // Preferí `total` si viene, si no `grandTotal`; si no, `subtotal/subTotal`
  const total = useMemo(() => {
    const s = cart?.summary
    if (!s) return 0
    return Number(s.total ?? s.grandTotal ?? s.subtotal ?? s.subTotal ?? 0)
  }, [cart?.summary])

  const isEmpty = useMemo(() => itemCount === 0, [itemCount])

  return {
    // Estado
    cart,
    isLoading,
    error,

    // Computados
    itemCount,
    total,
    isEmpty,

    // Acciones
    addItem,
    addProduct,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    mergeCarts,
    validateForCheckout,
    refetch: fetchCart,
  }
}
