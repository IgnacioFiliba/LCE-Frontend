/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { Order } from "../types/orders"
import { ordersService } from "../services/orders-service"

// Hook específico para obtener órdenes del usuario (para el perfil)
export const useUserOrders = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserOrders = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userOrders = await ordersService.getOrdersByUserId(userId)
      setOrders(userOrders)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar las órdenes"
      setError(errorMessage)
      console.error("Error fetching user orders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserOrders()
  }, [userId])

  const refetch = () => {
    fetchUserOrders()
  }

  // Funciones helper
  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  const getTotalSpent = () => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const getRecentOrders = (limit: number = 5) => {
    return orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
  }

  return {
    orders,
    isLoading,
    error,
    refetch,
    // Helper functions
    getOrdersByStatus,
    getTotalSpent,
    getRecentOrders,
    // Computed values
    totalOrders: orders.length,
    isEmpty: orders.length === 0,
  }
}

// Hook para una orden específica
export const useSingleOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!orderId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const orderData = await ordersService.getOrderById(orderId)
      setOrder(orderData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar la orden"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const refetch = () => {
    fetchOrder()
  }

  return {
    order,
    isLoading,
    error,
    refetch,
  }
}

// Hook completo con crear y obtener órdenes
export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Estados específicos para crear órdenes
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const fetchUserOrders = async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const userOrders = await ordersService.getOrdersByUserId(userId)
      setOrders(userOrders)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las órdenes'
      setError(errorMessage)
      console.error('Error fetching user orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserOrders()
    }
  }, [userId])

  // Función para crear orden
  const createOrder = async (orderData: any) => {
    setIsCreating(true)
    setCreateError(null)
    
    try {
      const response = await ordersService.createOrder(orderData)
      
      // Actualizar lista de órdenes si tenemos userId
      if (userId) {
        await fetchUserOrders()
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la orden'
      setCreateError(errorMessage)
      console.error('Error creating order:', err)
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const refetch = () => {
    if (userId) {
      fetchUserOrders()
    }
  }

  // Funciones helper
  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  const getTotalSpent = () => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const getRecentOrders = (limit: number = 5) => {
    return orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
  }

  return {
    // Estados principales
    orders,
    isLoading: isLoading || isCreating, // Combina ambos loadings
    error: error || createError, // Combina ambos errores
    refetch,
    
    // Crear órdenes
    createOrder,
    isCreating,
    createError,
    
    // Helper functions
    getOrdersByStatus,
    getTotalSpent,
    getRecentOrders,
    
    // Computed values
    totalOrders: orders.length,
    isEmpty: orders.length === 0,
  }
}