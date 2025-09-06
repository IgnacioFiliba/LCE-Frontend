// types/payments.ts
export interface CreatePaymentPreferenceRequest {
  cartId?: string // ✅ Cambiar de orderId a cartId (opcional porque va en URL)
  // Otros campos que pueda necesitar tu backend
  userId?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface CreatePaymentPreferenceResponse {
  ok?: boolean // ✅ Hacer opcional porque tu backend no lo devuelve
  message?: string
  preferenceId?: string
  preference_id?: string // ✅ Agregar versión con underscore
  initPoint?: string // URL de MercadoPago para redirección
  init_point?: string // ✅ Agregar versión con underscore
  // Otros campos que devuelva tu backend
}

export interface PaymentSuccessRequest {
  paymentId?: string
  orderId?: string // ✅ Mantener orderId aquí porque MP devuelve la orden
  status?: string
  // Campos del webhook de MercadoPago
}

export interface PaymentFailureRequest {
  paymentId?: string
  orderId?: string // ✅ Mantener orderId aquí porque MP devuelve la orden
  status?: string
  reason?: string
  // Campos del webhook de MercadoPago
}

export interface PaymentResponse {
  ok: boolean
  message: string
}
