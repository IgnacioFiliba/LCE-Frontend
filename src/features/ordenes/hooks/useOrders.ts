/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react"
import OrderService from "../services/service-orders"
import {
  Order,
  OrderStats,
  GetOrdersParams,
  CreateOrderRequest,
  OrderStatus,
} from "../types/orders"

interface UseOrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
  totalOrders: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  stats?: OrderStats
}

interface UseOrdersDerived {
  /** conteos globales (independientes del filtro activo) */
  pendingOrders: number
  approvedOrders: number
  deliveredOrders: number
  canceledOrders: number
}

interface UseOrdersActions {
  fetchOrders: (params?: GetOrdersParams) => Promise<void>
  fetchOrderStats: () => Promise<void>
  createOrder: (orderData: CreateOrderRequest) => Promise<boolean>
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    notes?: string
  ) => Promise<boolean>
  approveOrder: (orderId: string, notes?: string) => Promise<boolean>
  cancelOrder: (orderId: string, notes?: string) => Promise<boolean>
  deliverOrder: (orderId: string, notes?: string) => Promise<boolean>
  searchOrders: (searchTerm: string) => Promise<void>
  filterByStatus: (status: OrderStatus | null) => Promise<void>
  refreshOrders: () => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: Partial<GetOrdersParams>) => void
  clearError: () => void
}

interface UseOrdersOptions {
  initialParams?: GetOrdersParams
  autoFetch?: boolean
  includeDashboard?: boolean
}

export type UseOrdersReturn = UseOrdersState &
  UseOrdersDerived &
  UseOrdersActions

const PAGE_SIZE_DEFAULT = 10

const normalize = (v?: string) =>
  (v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")

/** Mapa Front (es) -> Back (en) */
const STATUS_MAP: Record<string, string[]> = {
  enpreparacion: ["onpreparation", "enpreparacion"],
  aprobada: ["approved"],
  entransito: ["intransit"],
  entregada: ["delivered", "completed"],
  cancelada: ["cancelled", "canceled"],
  devuelta: ["returned"],
}

// Aprobada si status=approved O paymentStatus=approved
const isApprovedOrder = (o: any) =>
  normalize(o?.status) === "approved" ||
  normalize(o?.paymentStatus) === "approved"

// Helpers de fecha
const getDate = (o: any) =>
  new Date(o?.date ?? o?.createdAt ?? 0).getTime()
const sortAscByDate = (arr: Order[]) =>
  [...arr].sort((a, b) => getDate(a) - getDate(b))

export const useOrders = (options: UseOrdersOptions = {}): UseOrdersReturn => {
  const { initialParams = {}, autoFetch = true, includeDashboard = false } =
    options

  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    loading: false,
    error: null,
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // 🟢 Filtros persistentes: por defecto arrancamos en "onPreparation"
  const [filters, setFiltersState] = useState<GetOrdersParams>({
    status: (initialParams.status as any) ?? ("onPreparation" as any),
    ...initialParams,
  })

  // Dataset completo para filtros/contadores globales
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [pageSize] = useState<number>(PAGE_SIZE_DEFAULT)

  const hasActiveFilter = useMemo(
    () => !!(filters.status || (filters.search && filters.search.trim().length)),
    [filters.status, filters.search]
  )

  const updateState = useCallback((updates: Partial<UseOrdersState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  // -------- Fetch de una página (modo normal)
  const fetchOrders = useCallback(
    async (params: GetOrdersParams = {}) => {
      updateState({ loading: true, error: null })
      try {
        const { page, limit } = params
        const response = await OrderService.getOrders({ page, limit })

        if (response?.data && response?.meta) {
          updateState({
            orders: Array.isArray(response.data) ? response.data : [],
            totalOrders: response.meta.total || 0,
            currentPage: response.meta.page || 1,
            totalPages: response.meta.totalPages || 1,
            hasNextPage:
              (response.meta.page || 1) < (response.meta.totalPages || 1),
            hasPrevPage: (response.meta.page || 1) > 1,
            loading: false,
          })
        } else if (Array.isArray(response)) {
          updateState({
            orders: response,
            totalOrders: response.length,
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            loading: false,
          })
        } else {
          updateState({
            orders: [],
            totalOrders: 0,
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            loading: false,
          })
        }
      } catch (error) {
        console.error("🔥 Error en fetchOrders:", error)
        updateState({
          loading: false,
          error:
            error instanceof Error ? error.message : "Error al cargar órdenes",
        })
      }
    },
    [updateState]
  )

  // -------- Fetch de todas las páginas (para filtros/contadores globales)
  const loadAllOrders = useCallback(async () => {
    try {
      const first = await OrderService.getOrders({ page: 1, limit: pageSize })
      let items: Order[] = []
      let totalPages = 1

      if (first?.data && first?.meta) {
        items = [...first.data]
        totalPages = first.meta.totalPages || 1

        const promises: Promise<any>[] = []
        for (let p = 2; p <= totalPages; p++) {
          promises.push(OrderService.getOrders({ page: p, limit: pageSize }))
        }
        if (promises.length) {
          const pages = await Promise.all(promises)
          for (const r of pages) if (r?.data) items = items.concat(r.data)
        }
      } else if (Array.isArray(first)) {
        items = first
      }

      setAllOrders(items)
    } catch (err) {
      console.error("🔥 Error cargando todas las órdenes:", err)
      setAllOrders([])
    }
  }, [pageSize])

  // -------- Stats (opcional)
  const fetchOrderStats = useCallback(async () => {
    try {
      const stats = await OrderService.getOrderStats()
      updateState({ stats })
    } catch (error) {
      console.error("Error loading order stats:", error)
    }
  }, [updateState])

  // -------- Crear
  const createOrder = useCallback(
    async (orderData: CreateOrderRequest): Promise<boolean> => {
      updateState({ loading: true, error: null })
      try {
        await OrderService.createOrder(orderData)
        await Promise.all([
          fetchOrders({ page: 1, limit: pageSize }),
          loadAllOrders(),
        ])
        updateState({ loading: false })
        return true
      } catch (error) {
        updateState({
          loading: false,
          error:
            error instanceof Error ? error.message : "Error al crear orden",
        })
        return false
      }
    },
    [fetchOrders, loadAllOrders, pageSize, updateState]
  )

  // -------- Actualizar estado
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, notes?: string) => {
      updateState({ error: null })
      try {
        await OrderService.updateOrderStatus(orderId, status, notes)
        // reflejar cambio local en ambos datasets
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() as any }
              : o
          ),
        }))
        setAllOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() as any }
              : o
          )
        )
        return true
      } catch (error) {
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Error al actualizar estado de orden",
        })
        return false
      }
    },
    [updateState]
  )

  const approveOrder = useCallback(
    async (orderId: string, notes?: string) =>
      updateOrderStatus(orderId, "Aprobada", notes),
    [updateOrderStatus]
  )
  const cancelOrder = useCallback(
    async (orderId: string, notes?: string) =>
      updateOrderStatus(orderId, "Cancelada", notes),
    [updateOrderStatus]
  )
  const deliverOrder = useCallback(
    async (orderId: string, notes?: string) =>
      updateOrderStatus(orderId, "Entregada", notes),
    [updateOrderStatus]
  )

  // -------- Filtros persistentes
  const searchOrders = useCallback(async (searchTerm: string) => {
    setFiltersState((prev) => ({ ...prev, search: searchTerm }))
  }, [])

  const filterByStatus = useCallback(async (status: OrderStatus | null) => {
    setFiltersState((prev) => ({ ...prev, status: status || undefined }))
  }, [])

  // -------- Refresh
  const refreshOrders = useCallback(async () => {
    await Promise.all([
      fetchOrders({ page: state.currentPage, limit: pageSize }),
      loadAllOrders(),
      includeDashboard ? fetchOrderStats() : Promise.resolve(),
    ])
  }, [
    fetchOrders,
    state.currentPage,
    pageSize,
    loadAllOrders,
    fetchOrderStats,
    includeDashboard,
  ])

  // -------- Paginación
  const setPage = useCallback(
    (page: number) => {
      updateState({ currentPage: page })
      // si no hay filtro activo, pedimos al backend esa página
      if (!hasActiveFilter) {
        fetchOrders({ page, limit: pageSize })
      }
      // con filtro activo, la paginación es local (no hacemos fetch aquí)
    },
    [fetchOrders, updateState, hasActiveFilter, pageSize]
  )

  const setFilters = useCallback((newFilters: Partial<GetOrdersParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // -------- Auto-load inicial
  useEffect(() => {
    if (!autoFetch) return

    // Pintado rápido con la primera página
    fetchOrders({ page: 1, limit: pageSize }).finally(() => null)

    // Si hay filtro activo al inicio (lo hay: onPreparation),
    // mantenemos loading hasta que carguemos TODO y apliquemos el filtro.
    ;(async () => {
      if (filters.status || (filters.search && filters.search.trim().length)) {
        updateState({ loading: true })
        await loadAllOrders()
        updateState({ loading: false })
      } else {
        // aunque no haya filtro, precargamos para contadores globales
        loadAllOrders()
      }
      if (includeDashboard) fetchOrderStats()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cuando cambian los filtros: resetea a página 1 (sin refetch backend)
  useEffect(() => {
    setState((prev) =>
      prev.currentPage === 1 ? prev : { ...prev, currentPage: 1 }
    )
  }, [filters.status, filters.search])

  // ---------- Filtrado + paginación local en “modo filtro” ----------
  const filteredAll = useMemo(() => {
    if (!hasActiveFilter) return []
    // 🧠 Base: si ya tenemos todas, usamos allOrders;
    // si todavía no, usamos la página actual para no dejar vacío.
    let list = (allOrders.length ? allOrders : state.orders) as Order[]

    if (filters.status) {
      const t = normalize(filters.status as string)
      if (t === "approved") {
        list = list.filter((o) => isApprovedOrder(o))
      } else if (t === "onpreparation") {
        list = list.filter((o) => normalize(o.status) === "onpreparation")
        // 🟢 ordenar más antiguas primero cuando estamos en "en preparación"
        list = sortAscByDate(list)
      } else {
        const accepted = STATUS_MAP[t] || [t]
        list = list.filter((o) => accepted.includes(normalize(o.status)))
      }
    }

    if (filters.search) {
      const q = normalize(filters.search)
      list = list.filter(
        (o) =>
          normalize(o.id).includes(q) ||
          normalize(o.user?.id || "").includes(q) ||
          normalize(o.user?.email || "").includes(q) ||
          normalize(o.user?.name || "").includes(q)
      )
    }
    return list
  }, [hasActiveFilter, allOrders, state.orders, filters.status, filters.search])

  const pagedFiltered = useMemo(() => {
    if (!hasActiveFilter) {
      return {
        orders: state.orders,
        total: state.totalOrders,
        page: state.currentPage,
        totalPages: state.totalPages,
        hasNextPage: state.hasNextPage,
        hasPrevPage: state.hasPrevPage,
      }
    }
    const total = filteredAll.length
    const page = state.currentPage
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const slice = filteredAll.slice(start, end)

    return {
      orders: slice,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }, [
    hasActiveFilter,
    filteredAll,
    state.orders,
    state.totalOrders,
    state.currentPage,
    state.totalPages,
    state.hasNextPage,
    state.hasPrevPage,
    pageSize,
  ])

  // -------- Contadores GLOBALes (independientes del filtro activo)
  const derivedCounts = useMemo<UseOrdersDerived>(() => {
    const source = allOrders.length ? allOrders : state.orders
    const n = (s: string) => normalize(s)
    const by = (pred: (o: Order) => boolean) => source.filter(pred).length
    return {
      pendingOrders: by((o) => n(o.status) === "onpreparation"),
      approvedOrders: by((o) => isApprovedOrder(o)),
      deliveredOrders: by((o) =>
        ["delivered", "completed"].includes(n(o.status))
      ),
      canceledOrders: by((o) =>
        ["cancelled", "canceled"].includes(n(o.status))
      ),
    }
  }, [allOrders, state.orders])

  // 🔑 Return
  return {
    // estado base
    ...state,
    // override en modo filtro (lista paginada en memoria)
    orders: pagedFiltered.orders,
    totalOrders: hasActiveFilter ? pagedFiltered.total : state.totalOrders,
    currentPage: hasActiveFilter ? pagedFiltered.page : state.currentPage,
    totalPages: hasActiveFilter ? pagedFiltered.totalPages : state.totalPages,
    hasNextPage: hasActiveFilter ? pagedFiltered.hasNextPage : state.hasNextPage,
    hasPrevPage: hasActiveFilter ? pagedFiltered.hasPrevPage : state.hasPrevPage,

    // derivados (GLOBALes)
    ...derivedCounts,

    // acciones
    fetchOrders,
    fetchOrderStats,
    createOrder,
    updateOrderStatus,
    approveOrder,
    cancelOrder,
    deliverOrder,
    searchOrders,
    filterByStatus,
    refreshOrders,
    setPage,
    setFilters,
    clearError,
  }
}

export default useOrders
