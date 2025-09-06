/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import productService from "../services/service-products"
import { GetProductsParams, Product, UpdateProductPayload } from "../types/products"

type UseProductsState = {
  products: Product[]
  loading: boolean
  error: string | null

  // paginación/ui
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  totalProducts: number          // 👈 agregado
  totalPages: number             // 👈 agregado
}

type UseProductsActions = {
  fetch: (params?: GetProductsParams) => Promise<void>
  refresh: () => Promise<void>
  search: (term: string) => Promise<void>
  setPage: (page: number) => void
  updateProduct: (id: string, payload: UpdateProductPayload) => Promise<boolean>
  clearError: () => void
}

export type UseProductsReturn = UseProductsState & UseProductsActions

const DEFAULT_LIMIT = 10

export default function useProducts(options: {
  initialParams?: GetProductsParams
  autoFetch?: boolean
} = {}): UseProductsReturn {
  const { initialParams = { limit: DEFAULT_LIMIT }, autoFetch = true } = options

  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: false,
    error: null,

    currentPage: initialParams.page ?? 1,
    limit: initialParams.limit ?? DEFAULT_LIMIT,
    hasNextPage: false,
    hasPrevPage: false,
    totalProducts: 0, // si el backend no envía total, estimamos
    totalPages: 1,
  })

  const [filters, setFilters] = useState<GetProductsParams>(initialParams)

  const setPartial = useCallback((patch: Partial<UseProductsState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const fetch = useCallback(async (params: GetProductsParams = {}) => {
    setPartial({ loading: true, error: null })

    try {
      const page = params.page ?? state.currentPage
      const limit = params.limit ?? state.limit

      const { data, meta } = await productService.getProducts({
        ...filters,
        ...params,
        page,
        limit,
      })

      // meta.hasNextPage viene del service (items.length === limit)
      const hasNextPage = !!meta.hasNextPage
      const hasPrevPage = page > 1

      // Si el backend NO envía total, lo estimamos.
      // En la última página (hasNextPage=false) podemos calcular exactamente:
      // total = (page - 1) * limit + data.length
      // En páginas intermedias mantenemos el mejor estimado posible (lower bound).
      let nextTotalProducts = state.totalProducts
      if (typeof meta?.total === "number") {
        nextTotalProducts = meta.total
      } else if (!hasNextPage) {
        nextTotalProducts = (page - 1) * limit + (Array.isArray(data) ? data.length : 0)
      } else {
        // lower bound: como mínimo ya vimos 'page * limit'
        nextTotalProducts = Math.max(state.totalProducts, page * limit)
      }

      const nextTotalPages =
        typeof meta?.total === "number"
          ? Math.max(1, Math.ceil(meta.total / limit))
          : (!hasNextPage
              ? Math.max(1, Math.ceil(nextTotalProducts / limit))
              : Math.max(1, page + 1)) // estimación mientras exista siguiente

      setState(prev => ({
        ...prev,
        products: Array.isArray(data) ? data : [],
        loading: false,
        error: null,

        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage,
        totalProducts: nextTotalProducts,
        totalPages: nextTotalPages,
      }))
    } catch (err: any) {
      setPartial({
        loading: false,
        error: err?.message ?? "Error al cargar productos",
      })
    }
  }, [filters, setPartial, state.currentPage, state.limit, state.totalProducts])

  const refresh = useCallback(async () => {
    await fetch({ page: state.currentPage, limit: state.limit })
  }, [fetch, state.currentPage, state.limit])

  const search = useCallback(async (term: string) => {
    setFilters(prev => ({ ...prev, search: term, page: 1 }))
    await fetch({ search: term, page: 1, limit: state.limit })
  }, [fetch, state.limit])

  const setPage = useCallback((page: number) => {
    if (page < 1) return
    setState(prev => ({ ...prev, currentPage: page }))
    // trigger fetch
    fetch({ page, limit: state.limit })
  }, [fetch, state.limit])

  const updateProduct = useCallback(async (id: string, payload: UpdateProductPayload): Promise<boolean> => {
    try {
      await productService.update(id, payload)
      // Refrescar fila localmente para mejor UX
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => (p.id === id ? { ...p, ...payload } as Product : p)),
      }))
      return true
    } catch (err: any) {
      setPartial({ error: err?.message ?? "No se pudo actualizar el producto" })
      return false
    }
  }, [setPartial])

  const clearError = useCallback(() => setPartial({ error: null }), [setPartial])

  // auto fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetch({ page: state.currentPage, limit: state.limit })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // memo opcional (no imprescindible)
  const products = useMemo(() => state.products, [state.products])

  return {
    ...state,
    products,
    fetch,
    refresh,
    search,
    setPage,
    updateProduct,
    clearError,
  }
}
