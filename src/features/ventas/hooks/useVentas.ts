// hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react"
import { DashboardFilters, DashboardStats } from "../types/ventas"
import { dashboardService } from "../services/ventas-service"


interface UseDashboardState {
  data: DashboardStats | null
  loading: boolean
  error: string | null
}

interface UseDashboardReturn extends UseDashboardState {
  // Acciones
  fetchDashboardStats: (filters?: DashboardFilters) => Promise<void>
  refreshData: () => Promise<void>
  clearError: () => void
  
  // Datos computados para fácil acceso
  totalOrders: number
  totalRevenue: number
  totalProductsSold: number
  topSellingProducts: Array<{
    productId: string
    productName: string
    totalQuantity: number
    totalRevenue: number
  }>
}

export const useDashboard = (initialFilters?: DashboardFilters): UseDashboardReturn => {
  const [state, setState] = useState<UseDashboardState>({
    data: null,
    loading: false,
    error: null,
  })

  // Función para obtener estadísticas
  const fetchDashboardStats = useCallback(async (filters?: DashboardFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      console.log("🔄 Cargando estadísticas del dashboard...")
      
      const data = await dashboardService.getDashboardStats(filters)
      
      setState({
        data,
        loading: false,
        error: null,
      })
      
      console.log("✅ Estadísticas cargadas exitosamente")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      
      console.error("❌ Error cargando estadísticas:", errorMessage)
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
    }
  }, [])

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    await fetchDashboardStats(initialFilters)
  }, [fetchDashboardStats, initialFilters])

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchDashboardStats(initialFilters)
  }, [fetchDashboardStats, initialFilters])

  // Datos computados
  const totalOrders = state.data?.summary.totalOrders ?? 0
  const totalRevenue = state.data?.summary.totalRevenue ?? 0
  const totalProductsSold = state.data?.summary.totalProductsSold ?? 0
  
  const topSellingProducts = state.data?.sales
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)
    .map(product => ({
      productId: product.productId,
      productName: product.productName,
      totalQuantity: product.totalQuantity,
      totalRevenue: product.totalRevenue,
    })) ?? []

  return {
    // Estado
    data: state.data,
    loading: state.loading,
    error: state.error,
    
    // Acciones
    fetchDashboardStats,
    refreshData,
    clearError,
    
    // Datos computados
    totalOrders,
    totalRevenue,
    totalProductsSold,
    topSellingProducts,
  }
}

// Hook específico para solo obtener el resumen (más liviano)
export const useDashboardSummary = (filters?: DashboardFilters) => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProductsSold: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const summaryData = await dashboardService.getDashboardSummary(filters)
      setSummary(summaryData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  }
}