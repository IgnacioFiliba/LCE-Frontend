// types/dashboard.ts
export interface SalesByDate {
  date: string
  quantity: number
}

export interface ProductSales {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
  salesByDate: SalesByDate[]
}

export interface DashboardSummary {
  totalOrders: number
  totalRevenue: number
  totalProductsSold: number
}

export interface DashboardStats {
  sales: ProductSales[]
  summary: DashboardSummary
}

// Para queries opcionales (filtros de fecha, etc.)
export interface DashboardFilters {
  startDate?: string
  endDate?: string
  productId?: string
}