/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { JSX, useEffect, useState } from "react"
import {
  Search,
  Package,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Eye,
  Check,
  ClipboardList,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { OrderStatus } from "../../types/orders"
import useOrders from "../../hooks/useOrders"
import OrderDetailModal from "../ModalOrdersDetail"
import useOrderActions from "../../hooks/useAprobbed"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu"

type FilterKey = "all" | "approved" | "onPreparation"
const FILTER_STORAGE_KEY = "ordersTable.filter"

const OrdersTable: React.FC = () => {
  const {
    orders,
    loading,
    error,
    totalOrders,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchOrders,
    refreshOrders,
    setPage,
    clearError,
    // desde el hook:
    filterByStatus,
    setFilters,
    pendingOrders,  // count de onPreparation
    approvedOrders, // count de approved
  } = useOrders({
    initialParams: { status: "onPreparation"},
    autoFetch: true,
  })

  // filtro persistente
  const [orderFilter, setOrderFilter] = useState<FilterKey>("all")

  // acciones
  const { isApproving, approveError, approveOrder, clearErrors, isUserAdmin } =
    useOrderActions()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --------- Persistencia del filtro ----------
  // cargar filtro guardado
  useEffect(() => {
    const saved = (localStorage.getItem(FILTER_STORAGE_KEY) as FilterKey) || "all"
    applyFilter(saved, false) // no forzar page fetch adicional
  }, [])

  // guardar filtro cuando cambie
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, orderFilter)
  }, [orderFilter])

  // aplica el filtro al hook y resetea a página 1
  const applyFilter = (key: FilterKey, bumpState = true) => {
    setOrderFilter(key)
    if (key === "all") {
      // limpia filtros locales del hook
      filterByStatus(null)
      setFilters({ status: undefined })
    } else if (key === "approved") {
      setFilters({ status: "approved" })
    } else if (key === "onPreparation") {
      setFilters({ status: "onPreparation" })
    }
    if (bumpState) setPage(1)
  }

  // búsqueda con debounce simple
  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term)
    if (term.length > 2 || term.length === 0) {
      await searchOrders(term)
      setPage(1)
    }
  }

  // aprobar
  const handleApproveOrder = async (orderId: string): Promise<void> => {
    setActionLoading(orderId)
    clearErrors()
    try {
      const success = await approveOrder(orderId)
      if (success) {
        toast.success("🎉 Orden aprobada correctamente")
        await refreshOrders()
      } else {
        toast.error(approveError || "Error al aprobar la orden")
      }
    } catch (error) {
      console.error("Error inesperado aprobando orden:", error)
      toast.error("Error inesperado al aprobar la orden")
    } finally {
      setActionLoading(null)
    }
  }

  // detalle
  const handleViewDetails = (order: any): void => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }
  const handleCloseModal = (): void => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  // map estados backend → frontend (incluye completed/canceled)
  const mapBackendStatus = (backendStatus: string): OrderStatus => {
    const key = (backendStatus || "").toLowerCase()
    const statusMap: Record<string, OrderStatus> = {
      onpreparation: "En Preparacion",
      "onpreparation ": "En Preparacion",
      approved: "Aprobada",
      intransit: "En Transito",
      delivered: "Entregada",
      completed: "Entregada",
      cancelled: "Cancelada",
      canceled: "Cancelada",
      returned: "Devuelta",
    }
    return statusMap[key] || "En Preparacion"
  }

  // badge estado
  const getStatusBadge = (status: OrderStatus): JSX.Element => {
    const statusStyles: Record<OrderStatus, string> = {
      "En Preparacion": "bg-blue-100 text-blue-800 border-blue-200",
      Aprobada: "bg-green-100 text-green-800 border-green-200",
      "En Transito": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Entregada: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Cancelada: "bg-red-100 text-red-800 border-red-200",
      Devuelta: "bg-orange-100 text-orange-800 border-orange-200",
    }
    const style = statusStyles[status] || statusStyles["En Preparacion"]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {status}
      </span>
    )
  }

  // formatos
  const formatPrice = (price: number, currency: string = "COP"): string =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace(/^\$/, "")

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("es-CO", { month: "short" })
    const year = date.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  const formatTime = (dateString: string): string =>
    new Date(dateString)
      .toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true })
      .replace(/\s/g, " ")

  // UI error
  const ErrorMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const safeOrders = Array.isArray(orders) ? orders : []

  if (loading && safeOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Órdenes Pendientes de Aprobación</h3>
          <p className="text-sm text-gray-500 mt-1">Cargando órdenes...</p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Órdenes Pendientes de Aprobación
              </h3>
              <p className="text-sm text-gray-500 mt-1">Gestiona las órdenes que requieren aprobación administrativa</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Órdenes pendientes</p>
              <p className="text-2xl font-bold text-red-600">{pendingOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Búsqueda + Filtro + Actualizar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de orden, cliente o email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {orderFilter === "all" && (
                    <>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Todas ({orders.length})
                    </>
                  )}
                  {orderFilter === "approved" && (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Aprobadas ({approvedOrders})
                    </>
                  )}
                  {orderFilter === "onPreparation" && (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      En Preparación ({pendingOrders})
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => applyFilter("all")}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Todas las órdenes ({totalOrders})
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => applyFilter("approved")}>
                  <Check className="h-4 w-4 mr-2" />
                  Aprobadas ({approvedOrders})
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => applyFilter("onPreparation")}>
                  <Clock className="h-4 w-4 mr-2" />
                  En Preparación ({pendingOrders})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={refreshOrders}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {/* Errores */}
          {approveError && <ErrorMessage message={`Error al aprobar orden: ${approveError}`} onClose={clearErrors} />}
          {error && <ErrorMessage message={error} onClose={clearError} />}

          {/* Tabla */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      {loading ? "Buscando órdenes..." : "No hay órdenes disponibles."}
                    </td>
                  </tr>
                ) : (
                  safeOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber ? order.orderNumber : `RP-${order.id?.slice(0, 8) || "unknown"}`}
                          </div>
                          <div className="text-sm text-gray-500">ID: {order.id?.slice(0, 8) || "N/A"}...</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{order.user?.name || "Cliente sin datos"}</div>
                            <div className="text-sm text-gray-500">{order.user?.email || "Email no disponible"}</div>
                            {order.user?.phone && <div className="text-xs text-gray-400">{order.user.phone}</div>}
                            <div className="text-xs text-gray-400">UserID: {order.user?.id?.slice(0, 8) || "N/A"}...</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.orderDetails?.products?.length || 0} producto
                          {(order.orderDetails?.products?.length || 0) !== 1 ? "s" : ""}
                        </div>
                        {order.orderDetails?.products?.length > 0 ? (
                          <div className="text-xs text-gray-500">
                            {order.orderDetails.products[0]?.name || "Producto sin nombre"}
                            {order.orderDetails.products.length > 1 &&
                              ` +${order.orderDetails.products.length - 1} más`}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500">Carrito vacío</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          {formatPrice(parseFloat(order.orderDetails?.price || "0"), "COP")}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(mapBackendStatus(order.status || "onPreparation"))}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            {order.date ? (
                              <>
                                <div className="font-medium">{formatDate(order.date)}</div>
                                <div className="text-xs text-gray-500">{formatTime(order.date)}</div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400">Fecha no disponible</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {order.status?.toLowerCase() === "onpreparation" && isUserAdmin && (
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={actionLoading === order.id || isApproving}
                            className="inline-flex items-center px-3 py-1 border border-green-300 rounded text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Aprobar orden"
                          >
                            {actionLoading === order.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            {actionLoading === order.id ? "Aprobando..." : "Aprobar"}
                          </button>
                        )}

                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center p-2 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2"
                          title="Ver detalles de la orden"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <div className="flex items-center justify-end space-x-2">
                          {order.status?.toLowerCase() === "onpreparation" && !isUserAdmin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              Solo Admin
                            </span>
                          )}
                          {(order.orderDetails?.products?.length || 0) === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Vacío
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {safeOrders.length} de {totalOrders || 0} órdenes
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((currentPage || 1) - 1)}
                disabled={!hasPrevPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage || 1} de {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((currentPage || 1) + 1)}
                disabled={!hasNextPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      <OrderDetailModal isOpen={isModalOpen} onClose={handleCloseModal} order={selectedOrder} />
    </div>
  )
}

export default OrdersTable
