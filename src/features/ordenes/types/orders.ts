/* eslint-disable @typescript-eslint/no-explicit-any */
// types/order.ts

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode?: string;
  brand?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  description?: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  invalidItemsCount: number;
  subTotal: number;
  grandTotal: number;
  shippingCost?: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export type OrderStatus = 
  | 'En Preparacion' 
  | 'Aprobada' 
  | 'En Transito' 
  | 'Entregada' 
  | 'Cancelada' 
  | 'Devuelta';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  summary: OrderSummary;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  userId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  shippingMethod?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  orderId?: string;
  search?: string;
  status?: OrderStatus;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
}