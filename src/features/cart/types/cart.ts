/* eslint-disable @typescript-eslint/no-explicit-any */
// types/cart.ts

// ✅ ACTUALIZADO: Interfaz para flags de estado del item
export interface CartItemFlags {
  priceChanged: boolean
  insufficientStock: boolean
  outOfStock: boolean
}

// ✅ ACTUALIZADO: CartItem según la respuesta real del backend
export interface CartItem {
  variantId: any
  id: string
  productId: string
  name: string
  imgUrl: string
  quantity: number
  unitPriceSnapshot: number
  unitPriceCurrent: number
  lineTotalCurrent: number
  unitPrice: number
  lineTotal: number
  price: number  // ✅ Agregado: existe en la respuesta
  total: number  // ✅ Agregado: existe en la respuesta
  amount: number // ✅ Agregado: existe en la respuesta
  flags: CartItemFlags
}

// ✅ ACTUALIZADO: Interfaz para el summary del carrito
export interface CartSummary {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
  invalidItemsCount: number
  subTotal: number    // ✅ Backend también devuelve este (duplicado)
  grandTotal: number  // ✅ Backend también devuelve este
}

// ✅ ACTUALIZADO: Cart según la respuesta real del backend
export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  summary: CartSummary
}

// ✅ COMPATIBILIDAD: Interfaz legacy para migración gradual
export interface LegacyCart {
  id: string
  status: string
  subtotal: number
  total: number
  currency: string
  items: LegacyCartItem[]
  lastValidatedAt: string | null
  updatedAt: string
}

export interface LegacyCartItem {
  id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  isValid: boolean
  product: ProductInCart
}

export interface ProductInCart {
  id: string
  name: string
  price: number
  imageUrl: string | null
}

// ✅ Request types (sin cambios)
export interface AddItemToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateItemQuantityRequest {
  quantity: number // 0 = eliminar
}

export interface MergeCartRequest {
  guestCartId?: string
}

// ✅ ACTUALIZADO: Response types usando la nueva estructura
export interface CartResponse {
  success: boolean
  data: Cart
  message?: string
}

export interface CartItemResponse {
  success: boolean
  data: CartItem
  message?: string
}

// ✅ Error types (sin cambios)
export interface CartError {
  message: string
  code?: string
  details?: any
}

// ✅ NUEVO: Helper types para validación
export interface CartValidation {
  id: string
  status: string
  items: CartItem[]
  summary: CartSummary
  total: number // Para compatibilidad con validaciones existentes
}

// ✅ NUEVO: Types para estados del carrito
export type CartStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED'
export type CartCurrency = 'USD' | 'MXN' | 'EUR'

// ✅ NUEVO: Helper para mapear entre estructuras (si necesitas compatibilidad)
export interface CartMapper {
  mapToLegacy(newCart: Cart): LegacyCart
  mapFromLegacy(legacyCart: LegacyCart): Cart
}