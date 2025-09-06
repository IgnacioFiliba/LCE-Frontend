// types/favorites.ts

// Estructura de categoría
export interface Category {
  id: string
  name: string
  products: string[]
}

// Estructura de orderDetails
export interface OrderDetails {
  id: string
  price: number
  order: string
  items: string[]
}

// Estructura de orderItem
export interface OrderItem {
  id: string
  product: string
  quantity: number
  unitPrice: number
  orderDetails: OrderDetails
}

// Estructura completa del producto
export interface Product {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  category: Category
  description: string
  orderItems: OrderItem[]
}

// Estructura de cartItem
export interface CartItem {
  id: string
  cart: string
  cartId: string
  product: Product
  productId: string
  quantity: number
  unitPriceSnapshot: number
}

// Estructura de order
export interface Order {
  id: string
  date: string // ISO date string
  status: string
  paymentStatus: string
  mpPreferenceId: string
  mpPaymentId: string
  orderDetails: OrderDetails
  user: string
}

// Estructura del cart
export interface Cart {
  id: string
  userId: string
  user: string
  items: CartItem[]
  updatedAt: string // ISO date string
  status: string
  mpPreferenceId: string
  mpPaymentId: string
}

// Estructura completa del usuario
export interface User {
  id: string
  name: string
  email: string
  password: string
  phone: number
  country: string
  address: string
  city: string
  imgUrl: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isBanned: boolean
  isVerified: boolean
  verificationToken: string
  orders: Order[]
  carts: Cart[]
  favorites: string[] // Array de IDs de productos favoritos
}

// Estructura completa del item de favoritos (respuesta del backend)
export interface FavoriteItem {
  id: string
  user: User
  userId: string
  product: Product
  productId: string
  createdAt: string // ISO date string
}

// Respuestas de la API
export interface FavoritesResponse {
  success: boolean
  message: string
  data: FavoriteItem[]
  total?: number
}

export interface AddToFavoritesResponse {
  success: boolean
  message: string
  data: FavoriteItem
}

export interface RemoveFromFavoritesResponse {
  success: boolean
  message: string
  data?: {
    productId: string
    removed: boolean
  }
}

export interface FavoritesError {
  success: false
  message: string
  error?: string
}

// Tipos auxiliares para el frontend
export interface FavoriteProductSimple {
  id: string
  name: string
  price: number
  imgUrl: string
  brand: string
  model: string
  year: string
  stock: number
}

// Para verificar si un producto está en favoritos
export interface IsFavoriteResponse {
  isFavorite: boolean
  favoriteId?: string
}