// hooks/useOrderActions.ts

import { useState } from "react"
import { OrdersService } from "../services/aprobbed-service"

export interface UseOrderActionsReturn {
  // Estados
  isApproving: boolean
  isUpdatingStatus: boolean
  approveError: string | null
  updateStatusError: string | null

  // Acciones
  approveOrder: (orderId: string) => Promise<boolean>
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus
  ) => Promise<boolean>
  clearErrors: () => void

  // Helper de autenticación
  isUserAdmin: boolean
}

export type OrderStatus =
  | "onPreparation"
  | "approved"
  | "inTransit"
  | "delivered"
  | "cancelled"
  | "returned"

const useOrderActions = (): UseOrderActionsReturn => {
  // Estados para aprobar orden
  const [isApproving, setIsApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)

  // Estados para actualizar status
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(
    null
  )

  // Verificar si es admin
  const isUserAdmin = OrdersService.isUserAdmin()

  /**
   * Aprobar una orden específica
   */
  const approveOrder = async (orderId: string): Promise<boolean> => {
    if (!orderId) {
      setApproveError("ID de orden es requerido")
      return false
    }

    // Verificar que el usuario sea admin
    if (!isUserAdmin) {
      setApproveError(
        "No tienes permisos para aprobar órdenes. Se requiere rol de administrador"
      )
      return false
    }

    setIsApproving(true)
    setApproveError(null)

    try {
      console.log("Aprobando orden:", orderId)
      const response = await OrdersService.approveOrder(orderId)

      if (response.success) {
        console.log("Orden aprobada exitosamente:", response.data)
        return true
      } else {
        setApproveError(
          response.error || "Error desconocido al aprobar la orden"
        )
        return false
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado"
      setApproveError(errorMessage)
      console.error("Error en approveOrder:", error)
      return false
    } finally {
      setIsApproving(false)
    }
  }

  /**
   * Actualizar el status de una orden
   */
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<boolean> => {
    if (!orderId) {
      setUpdateStatusError("ID de orden es requerido")
      return false
    }

    if (!newStatus) {
      setUpdateStatusError("Nuevo status es requerido")
      return false
    }

    // Verificar que el usuario sea admin
    if (!isUserAdmin) {
      setUpdateStatusError(
        "No tienes permisos para cambiar el status de órdenes. Se requiere rol de administrador"
      )
      return false
    }

    setIsUpdatingStatus(true)
    setUpdateStatusError(null)

    try {
      console.log("Actualizando status de orden:", { orderId, newStatus })
      const response = await OrdersService.updateOrderStatus(orderId, newStatus)

      if (response.success) {
        console.log("Status actualizado exitosamente:", response.data)
        return true
      } else {
        setUpdateStatusError(
          response.error || "Error desconocido al actualizar el status"
        )
        return false
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado"
      setUpdateStatusError(errorMessage)
      console.error("Error en updateOrderStatus:", error)
      return false
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  /**
   * Limpiar todos los errores
   */
  const clearErrors = (): void => {
    setApproveError(null)
    setUpdateStatusError(null)
  }

  return {
    // Estados
    isApproving,
    isUpdatingStatus,
    approveError,
    updateStatusError,

    // Acciones
    approveOrder,
    updateOrderStatus,
    clearErrors,

    // Helper
    isUserAdmin,
  }
}

export default useOrderActions
