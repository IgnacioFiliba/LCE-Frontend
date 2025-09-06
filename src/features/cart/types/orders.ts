export interface Order {
  id: string
  userId: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total: number
  subtotal?: number
  tax?: number
  discount?: number
  createdAt: string
  updatedAt: string
  products: OrderProduct[]
  shippingAddress?: Address
  billingAddress?: Address
}

export interface OrderProduct {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  imgUrl?: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CreateOrderRequest {
  userId: string
  products: {
    id: string
  }[]
}

export interface CreateOrderResponse {
  id: string
  status: string
  message: string
  order: Order
}
