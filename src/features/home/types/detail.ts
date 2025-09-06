// types/productDetail.ts
export interface ProductDetailCategory {
  id: string
  name: string
  products: string[]
}

export interface ProductDetailUser {
  id: string
  name: string
  email: string
  password: string
  phone: number
  country: string
  address: string
  city: string
  isAdmin: boolean
  isSuperAdmin: boolean
  orders: string[]
}

export interface ProductDetailOrder {
  id: string
  date: string
  status: string
  orderDetails: string
  user: ProductDetailUser
}

export interface ProductDetailOrderDetail {
  id: string
  price: number
  order: ProductDetailOrder
  products: string[]
}

export interface ProductDetailResponse {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  category: ProductDetailCategory
  description: string
  orderDetails: ProductDetailOrderDetail[]
}